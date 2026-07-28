import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AlarmaScreen() {
  const router = useRouter();
  const [alarmState, setAlarmState] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)")}
          accessibilityLabel="Volver"
          accessibilityRole="button"
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alarma</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => setAlarmState(!alarmState)}
          style={styles.alarmButton}
        >
          <Image
            style={styles.alarmIcon}
            source={require("../../assets/img/icon-alarm.png")}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Activar Alarma</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2ECE0" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: "#F6F0E3",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1C1C1E" },
  spacer: { width: 24 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, color: "#8A8378" },
  alarmButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 300,
    height: 300,
    borderRadius: 400,
    backgroundColor: "#C43B26",
    marginBottom: 20,
  },
  alarmIcon: {
    width: 250,
    height: 250,
  },
});
