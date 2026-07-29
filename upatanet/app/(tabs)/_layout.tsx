import { Tabs } from "expo-router";
import React from "react";

import { Colors } from "@/constants/upatanet-theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Noticias",
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: "Mapa",
        }}
      />
      <Tabs.Screen
        name="alarma"
        options={{
          title: "Alarma",
        }}
      />
      <Tabs.Screen
        name="configuracion"
        options={{
          title: "Configuración",
        }}
      />
    </Tabs>
  );
}
