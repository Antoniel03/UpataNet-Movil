import "@/src/sync/polyfills";

import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { initDatabase } from '@/src/db/database';
import { initSync, subscribe as subscribeSync } from '@/src/sync/SyncService';
import { notifyChange } from '@/src/data/noticiasStore';

const UpatanetTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F2ECE0',
    card: '#F6F0E3',
    text: '#1C1C1E',
    border: '#DFDAD0',
    primary: '#C43B26',
    notification: '#C43B26',
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initDatabase()
      .then(async () => {
        await initSync();
        subscribeSync({ onNoticiasChange: () => notifyChange() });
        setReady(true);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al iniciar'));
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2ECE0' }}>
        <StatusBar style="dark" />
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2ECE0' }}>
        <ActivityIndicator size="large" color="#C43B26" />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <ThemeProvider value={UpatanetTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="noticia" options={{ headerShown: false }} />
        <Stack.Screen name="publicar" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
