import { useState, useCallback, useRef, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, Characteristic, BleError } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

import { ESP32_DEVICE_NAME, BLE_SCAN_TIMEOUT_MS, LED_ON_PAYLOAD, LED_OFF_PAYLOAD } from '@/constants/ble-config';

export type AlarmStatus = 'idle' | 'verifying' | 'triggered' | 'error';

export enum BleErrorCode {
  BluetoothPoweredOff = 'BluetoothPoweredOff',
  DeviceNotFound = 'DeviceNotFound',
  ConnectionFailed = 'ConnectionFailed',
  ServiceDiscoveryFailed = 'ServiceDiscoveryFailed',
  CharacteristicNotFound = 'CharacteristicNotFound',
  WriteFailed = 'WriteFailed',
  Unknown = 'Unknown',
}

export class BleAlarmError extends Error {
  constructor(public readonly code: BleErrorCode, message: string) {
    super(message);
    this.name = 'BleAlarmError';
  }
}

function resolveHumanError(error: unknown): string {
  if (error instanceof BleAlarmError) {
    switch (error.code) {
      case BleErrorCode.BluetoothPoweredOff:
        return 'Bluetooth está apagado o sin permisos. Actívalo en ajustes.';
      case BleErrorCode.DeviceNotFound:
        return `No se encuentra el dispositivo "${ESP32_DEVICE_NAME}". ¿Está encendido?`;
      case BleErrorCode.ConnectionFailed:
        return 'No se pudo conectar al dispositivo. Intenta acercar el teléfono.';
      case BleErrorCode.ServiceDiscoveryFailed:
        return 'Error descubriendo servicios BLE. Reinicia el ESP32.';
      case BleErrorCode.CharacteristicNotFound:
        return 'El ESP32 no expone la característica esperada. Verifica el firmware.';
      case BleErrorCode.WriteFailed:
        return 'Falló el envío de la orden. Reintenta.';
      default:
        return error.message;
    }
  }
  if (error instanceof Error) {
    return `Error inesperado: ${error.message}`;
  }
  return 'Error desconocido al operar la alarma.';
}

let _bleManager: BleManager | null = null;

function getBleManager(): BleManager {
  if (!_bleManager) {
    _bleManager = new BleManager();
  }
  return _bleManager;
}

export function isBleAvailable(): boolean {
  try {
    const mgr = new BleManager();
    return mgr != null;
  } catch {
    return false;
  }
}

async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const apiLevel = Platform.Version as number;
    if (apiLevel < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        { title: 'Permiso de ubicación', message: 'Upatanet necesita acceso a ubicación para escanear dispositivos BLE', buttonPositive: 'OK' }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);
    return (
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch {
    return false;
  }
}

export function useBleAlarm() {
  const deviceRef = useRef<Device | null>(null);
  const charRef = useRef<Characteristic | null>(null);
  const [status, setStatus] = useState<AlarmStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetStatus = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  const ensureAdapterOn = useCallback(async (): Promise<boolean> => {
    try {
      const state = await getBleManager().state();
      if (state === 'PoweredOn') return true;
      return false;
    } catch {
      return false;
    }
  }, []);

  const findDevice = useCallback(async (): Promise<Device> => {
    const mgr = getBleManager();
    const currentState = await mgr.state();
    
    return new Promise((resolve, reject) => {
      let deviceFound = false;
      const timeout = setTimeout(() => {
        if (!deviceFound) reject(new BleAlarmError(BleErrorCode.DeviceNotFound, 'Timeout escaneo'));
      }, BLE_SCAN_TIMEOUT_MS);

      const subscription = mgr.onStateChange((state) => {
        if (state !== 'PoweredOn') return;
        mgr.startDeviceScan(
          null,
          { allowDuplicates: false },
          (error, device) => {
            if (error) {
              clearTimeout(timeout);
              subscription.remove();
              reject(new BleAlarmError(BleErrorCode.Unknown, error.message));
              return;
            }
            if (device && device.name === ESP32_DEVICE_NAME) {
              deviceFound = true;
              clearTimeout(timeout);
              subscription.remove();
              mgr.stopDeviceScan();
              resolve(device);
            }
          },
        );
      }, true);

      if (currentState === 'PoweredOn') {
        mgr.startDeviceScan(
          null,
          { allowDuplicates: false },
          (error, device) => {
            if (error) {
              clearTimeout(timeout);
              subscription.remove();
              reject(new BleAlarmError(BleErrorCode.Unknown, error.message));
              return;
            }
            if (device && device.name === ESP32_DEVICE_NAME) {
              deviceFound = true;
              clearTimeout(timeout);
              subscription.remove();
              mgr.stopDeviceScan();
              resolve(device);
            }
          },
        );
      }
    });
  }, []);

  const connectAndDiscover = useCallback(
    async (device: Device): Promise<Characteristic> => {
      try {
        await device.connect();
        await device.discoverAllServicesAndCharacteristics();
        const services = await device.services();
        for (const service of services) {
          const characteristics = await service.characteristics();
          for (const char of characteristics) {
            if (char.isWritableWithResponse || char.isWritableWithoutResponse) {
              return char;
            }
          }
        }
        throw new BleAlarmError(BleErrorCode.CharacteristicNotFound, 'No hay característica escribible');
      } catch (e) {
        if (e instanceof BleAlarmError) throw e;
        throw new BleAlarmError(BleErrorCode.ConnectionFailed, 'Error conectando/descubriendo servicios');
      }
    },
    [],
  );

  const writePayload = useCallback(
    async (device: Device, payload: string) => {
      const char = charRef.current;
      if (!char) throw new Error('Característica no inicializada');
      const base64Payload = Buffer.from(payload, 'ascii').toString('base64');
      console.log('[BLE] Escribiendo payload:', payload, '-> base64:', base64Payload);
      await device.writeCharacteristicWithResponseForService(char.serviceUUID, char.uuid, base64Payload);
      console.log('[BLE] Escritura OK');
    },
    [],
  );

  const safeDisconnect = useCallback(async (device: Device) => {
    try {
      const connected = await device.isConnected();
      if (connected) {
        await device.cancelConnection();
      }
    } catch {
      // best-effort cleanup
    }
  }, []);

  const runAlarmCycle = useCallback(
    async (payload: string, onSuccessStatus: AlarmStatus) => {
      console.log('[BLE] runAlarmCycle inicio, payload:', payload);
      setStatus('verifying');
      setErrorMessage(null);
      let device: Device | null = null;
      try {
        if (!isBleAvailable()) {
          throw new BleAlarmError(
            BleErrorCode.Unknown,
            'BLE no está disponible. Requiere un Development Build (expo-dev-client), no Expo Go.',
          );
        }
        const permissionsGranted = await requestBlePermissions();
      if (!permissionsGranted) {
        throw new BleAlarmError(BleErrorCode.Unknown, 'Permisos BLE no concedidos. Actívalos en ajustes.');
      }
      const adapterReady = await ensureAdapterOn();
        console.log('[BLE] Adapter ready:', adapterReady);
        if (!adapterReady) {
          throw new BleAlarmError(BleErrorCode.BluetoothPoweredOff, 'Bluetooth apagado o sin permisos.');
        }
        device = await findDevice();
        console.log('[BLE] Dispositivo encontrado, conectando y descubriendo...');
        const char = await connectAndDiscover(device);
        charRef.current = char;
        deviceRef.current = device;
        await writePayload(device, payload);
        console.log('[BLE] Éxito total, status:', onSuccessStatus);
        setStatus(onSuccessStatus);
      } catch (error) {
        console.log('[BLE] ERROR en runAlarmCycle:', error);
        setStatus('error');
        setErrorMessage(resolveHumanError(error));
        if (device) {
          await safeDisconnect(device);
        }
      }
    },
    [ensureAdapterOn, findDevice, connectAndDiscover, writePayload, safeDisconnect],
  );

  const turnOffAlarm = useCallback(async () => {
    console.log('[BLE] turnOffAlarm - usando device guardado');
    const device = deviceRef.current;
    if (!device) {
      console.log('[BLE] No hay device guardado');
      setStatus('idle');
      return;
    }
    try {
      await writePayload(device, LED_OFF_PAYLOAD);
      await safeDisconnect(device);
      deviceRef.current = null;
      charRef.current = null;
      setStatus('idle');
      console.log('[BLE] Alarma apagada OK');
    } catch (error) {
      console.log('[BLE] Error apagando:', error);
      setStatus('idle');
    }
  }, [writePayload, safeDisconnect]);

  const triggerAlarm = useCallback(async () => {
    console.log('[BLE] triggerAlarm EJECUTADO');
    if (status === 'verifying' || status === 'triggered') {
      return;
    }
    await runAlarmCycle(LED_ON_PAYLOAD, 'triggered');
  }, [runAlarmCycle, status]);

  useEffect(() => {
    return () => {
      if (deviceRef.current) {
        safeDisconnect(deviceRef.current).catch(() => {});
        deviceRef.current = null;
        charRef.current = null;
      }
    };
  }, [safeDisconnect]);

  return {
    status,
    errorMessage,
    triggerAlarm,
    turnOffAlarm,
    resetStatus,
  };
}