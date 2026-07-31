import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/upatanet-theme";
import { clearUserData } from "@/src/data/usuario-store";
import { loadSyncServerUrl, setSyncServerUrl } from "@/src/data/config-store";
import { useUsuario } from "@/src/hooks/use-usuario";
import { isSyncConnected, reconnectSync } from "@/src/sync/SyncService";

const C = Colors.light;

export default function ConfiguracionScreen() {
  const { perfil, loading, savePerfil } = useUsuario();
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tribe, setTribe] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [serverUrl, setServerUrl] = useState("");
  const [serverError, setServerError] = useState("");
  const [connected, setConnected] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadSyncServerUrl().then(setServerUrl);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setConnected(isSyncConnected());
    }, 2000);
    setConnected(isSyncConnected());
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (perfil) {
      setName(perfil.nombre);
      setLastName(perfil.apellido);
      setTribe(perfil.comunidad);
    }
  }, [perfil]);

  function handleSave() {
    setShowSaveModal(true);
  }

  async function confirmSave() {
    setShowSaveModal(false);
    await savePerfil({ nombre: name, apellido: lastName, comunidad: tribe });
  }

  async function handleClear() {
    setShowClearModal(false);
    await clearUserData();
    setName("");
    setLastName("");
    setTribe("");
  }

  function handleSaveServer() {
    setServerError("");
    if (serverUrl.trim() === "") {
      setServerError("Ingrese una dirección válida");
      return;
    }
    setShowServerModal(true);
  }

  async function confirmSaveServer() {
    setShowServerModal(false);
    const normalized = await setSyncServerUrl(serverUrl);
    setServerUrl(normalized);
    reconnectSync(normalized);
    setConnected(isSyncConnected());
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)")}
          accessibilityLabel="Volver"
          accessibilityRole="button"
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => setShowClearModal(true)}
        >
          <Text style={styles.clearButtonText}>Limpiar datos</Text>
        </TouchableOpacity>

        <View style={styles.serverSection}>
          <Text style={styles.serverTitle}>Servidor de sincronización</Text>
          <Text
            style={[
              styles.serverStatus,
              { color: connected ? C.success : C.primaryDark },
            ]}
          >
            Estado: {connected ? "Conectado" : "Desconectado"}
          </Text>
          <TextInput
            value={serverUrl}
            onChangeText={(text) => {
              setServerUrl(text);
              if (serverError !== "") setServerError("");
            }}
            placeholderTextColor="#FFFFFF"
            placeholder="ws://192.168.x.x:1234"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          {serverError !== "" && (
            <Text style={styles.serverErrorText}>{serverError}</Text>
          )}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveServer}
          >
            <Text style={styles.saveButtonText}>Guardar servidor</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showSaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              ¿Está seguro de que quiere guardar los cambios hechos?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: C.primary }]}
                onPress={confirmSave}
              >
                <Text style={styles.modalBtnText}>Sí</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: C.modalButtonGray }]}
                onPress={() => setShowSaveModal(false)}
              >
                <Text style={styles.modalBtnText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showClearModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClearModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              ¿Está seguro de que quiere limpiar sus datos de usuario?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: C.primaryDark }]}
                onPress={handleClear}
              >
                <Text style={styles.modalBtnText}>Sí, limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: C.success }]}
                onPress={() => setShowClearModal(false)}
              >
                <Text style={styles.modalBtnText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showServerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowServerModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              ¿Está seguro de que quiere guardar la nueva dirección del servidor
              de sincronización?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: C.primary }]}
                onPress={confirmSaveServer}
              >
                <Text style={styles.modalBtnText}>Sí</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: C.modalButtonGray }]}
                onPress={() => setShowServerModal(false)}
              >
                <Text style={styles.modalBtnText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: C.surfaceTop,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: C.text },
  spacer: { width: 24 },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: C.text,
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
    color: C.textInverse,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    width: "75%",
    backgroundColor: C.primary,
  },
  containerUserImage: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.primary,
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
  saveButton: {
    height: 47,
    borderRadius: 23.5,
    width: 225,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: C.textInverse,
  },
  clearButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: C.primaryDark,
    textDecorationLine: "underline",
  },
  serverSection: {
    marginTop: 24,
    alignItems: "center",
    width: "100%",
  },
  serverTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: C.text,
    marginBottom: 4,
  },
  serverStatus: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
  },
  serverErrorText: {
    fontSize: 11,
    color: C.primaryDark,
    marginTop: -8,
    marginBottom: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: 291,
    backgroundColor: C.modalBg,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    lineHeight: 22,
    color: C.textInverse,
    textAlign: "center",
    marginBottom: 20,
  },
  modalActions: { flexDirection: "row", gap: 12 },
  modalBtn: {
    width: 100,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnText: { fontSize: 14, fontWeight: "600", color: C.textInverse },
});
