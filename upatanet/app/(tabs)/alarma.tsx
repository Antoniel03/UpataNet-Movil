import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/upatanet-theme';
import { useBleAlarm } from '@/hooks/use-ble-alarm';
import { useAlarmaPublicacion } from '@/src/hooks/useAlarmaPublicacion';
import { addAlarmActivation, initSync } from '@/src/sync/SyncService';
import * as Crypto from 'expo-crypto';

const COMMUNITY_ID = 'mi-comunidad';

let peerId: string | null = null;
async function getPeerId(): Promise<string> {
  if (peerId) return peerId;
  const randomBytes = await Crypto.getRandomBytes(16);
  peerId = Array.from(randomBytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return peerId;
}

export default function AlarmaScreen() {
  const router = useRouter();
  const {
    status,
    errorMessage,
    triggerAlarm,
    turnOffAlarm,
    resetStatus,
  } = useBleAlarm();
  const [isBusy, setIsBusy] = useState(false);
  const [isSyncInitialized, setIsSyncInitialized] = useState(false);

  useAlarmaPublicacion({ status });

  useEffect(() => {
    if (!isSyncInitialized) {
      void initSync();
      setIsSyncInitialized(true);
    }
  }, [isSyncInitialized]);

  useEffect(() => {
    if (status === 'idle' || status === 'triggered' || status === 'error') {
      setIsBusy(false);
    }
  }, [status]);

  const handlePress = useCallback(async () => {
    if (isBusy) return;
    setIsBusy(true);

    if (status === 'triggered') {
      await turnOffAlarm();
      setIsBusy(false);
      return;
    }

    if (status === 'error') {
      resetStatus();
      setIsBusy(false);
      return;
    }

    try {
      const authorPeerId = await getPeerId();
      await triggerAlarm();
      await addAlarmActivation({
        id: `${authorPeerId}-${Date.now()}`,
        communityId: COMMUNITY_ID,
        authorPeerId,
        esp32Mac: 'ESP32_Alarma',
        action: 'on',
        timestamp: Date.now(),
      });
    } catch (e) {
      console.error('[Alarma] Error al activar:', e);
    } finally {
      setIsBusy(false);
    }
  }, [status, isBusy, triggerAlarm, turnOffAlarm, resetStatus]);

  const buttonLabel = (() => {
    switch (status) {
      case 'verifying':
        return 'Conectando...';
      case 'triggered':
        return 'Alarma ACTIVA — pulsa para apagar';
      case 'error':
        return 'Error — pulsa para reintentar';
      default:
        return 'ACTIVAR ALARMA';
    }
  })();

  const buttonColor =
    status === 'triggered'
      ? Colors.light.success
      : status === 'error'
        ? Colors.light.modalButtonGray
        : status === 'verifying'
          ? Colors.light.borderSubtle
          : Colors.light.primary;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push('/(tabs)')}
          accessibilityLabel="Volver"
          accessibilityRole="button"
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Alarma</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.content}>
        <Pressable
          onPress={handlePress}
          disabled={isBusy}
          accessibilityLabel={buttonLabel}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.alarmButton,
            { backgroundColor: buttonColor },
            pressed && styles.alarmButtonPressed,
            isBusy && styles.alarmButtonDisabled,
          ]}
        >
          {isBusy || status === 'verifying' ? (
            <ActivityIndicator size="large" color={Colors.light.textInverse} />
          ) : (
            <Image
              style={styles.alarmIcon}
              source={require('../../assets/img/icon-alarm.png')}
            />
          )}
        </Pressable>
        <Text style={styles.title}>{buttonLabel}</Text>

        {errorMessage && status === 'error' && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: Colors.light.surfaceTop,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  spacer: { width: 24 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  alarmButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.light.primary,
    marginBottom: 20,
  },
  alarmButtonPressed: {
    opacity: 0.85,
  },
  alarmButtonDisabled: {
    opacity: 0.6,
  },
  alarmIcon: {
    width: 250,
    height: 250,
  },
  errorText: {
    fontSize: 14,
    color: Colors.light.primaryDark,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
});