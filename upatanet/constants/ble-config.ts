// Configuración del dispositivo de alarma ESP32.
// El nombre debe coincidir con BLEDevice::init("...") en el firmware del ESP32.
// Reemplazar este valor cuando se defina el nombre final del firmware.

export const ESP32_DEVICE_NAME = 'ESP32_Alarma';

export const BLE_SCAN_TIMEOUT_MS = 10000;

export const LED_ON_PAYLOAD = '1';
export const LED_OFF_PAYLOAD = '0';