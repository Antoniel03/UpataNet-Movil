import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConfiguracionScreen() {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tribe, setTribe] = useState("");
  const router = useRouter();

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
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.content}>
        <View style={styles.containerUserImage}>
          <Ionicons name="person-circle-outline" size={150} color="#FFFFFF" />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.title}>Nombre</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholderTextColor="#FFFFFF"
            placeholder="Nombre de usuario"
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => console.log("Editar nombre")}
          >
            <FontAwesome6 name="pencil" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.title}>Apellido</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor="#FFFFFF"
            placeholder="Apellido de usuario"
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => console.log("Editar apellido")}
          >
            <FontAwesome6 name="pencil" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.title}>Tribu</Text>
          <TextInput
            value={tribe}
            onChangeText={setTribe}
            placeholderTextColor="#FFFFFF"
            placeholder="Tribu a la que pertenece"
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => console.log("Editar tribu")}
          >
            <FontAwesome6 name="pencil" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
    fontSize: 17,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  inputContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    flexDirection: "column",
    width: "110%",
    marginTop: 12,
    marginLeft: 90,
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    color: "#F2ECE0",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    width: "75%",
    backgroundColor: "#C43B26",
  },
  containerUserImage: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C43B26",
    width: 200,
    height: 200,
    borderRadius: 200,
    marginBottom: 16,
  },
  editButton: {
    position: "absolute",
    right: 115,
    top: 50,
    padding: 0,
  },
});
