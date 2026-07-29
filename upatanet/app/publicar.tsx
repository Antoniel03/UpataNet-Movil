import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CATEGORIES } from "@/data/categories";
import { Colors } from "@/constants/upatanet-theme";
import { useNoticias } from "@/src/hooks/useNoticias";

const C = Colors.light;

export default function PublicarScreen() {
  const router = useRouter();
  const { publishNoticia } = useNoticias();
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = React.useState(false);
  const [showExitModal, setShowExitModal] = React.useState(false);

  const isValid = title.trim() && body.trim() && selectedCategory;

  function handlePublish() {
    Keyboard.dismiss();
    setShowPublishModal(true);
  }

  async function confirmPublish() {
    const id = await publishNoticia({ title, body, category: selectedCategory! });
    setShowPublishModal(false);
    router.replace({ pathname: "/noticia", params: { id: String(id) } });
  }

  function handleBack() {
    if (title.trim() || body.trim() || selectedCategory) {
      Keyboard.dismiss();
      setShowExitModal(true);
    } else {
      router.back();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} accessibilityLabel="Cerrar" accessibilityRole="button" hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Ionicons name="close" size={24} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva publicación</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>TÍTULO</Text>
          <TextInput
            style={styles.input}
            placeholder="Escriba el título..."
            placeholderTextColor={C.placeholderText}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>CUERPO</Text>
          <TextInput
            style={[styles.input, styles.bodyInput]}
            placeholder="Escriba el cuerpo del reporte..."
            placeholderTextColor={C.placeholderText}
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>CATEGORÍA</Text>
          <View style={styles.chipsRow}>
            {CATEGORIES.map((cat) => {
              const selected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.chip,
                    selected && { backgroundColor: C.chipBgActive },
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  accessibilityRole="button"
                >
                  <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={16} color={selected ? C.text : cat.color} />
                  <Text style={[styles.chipLabel, selected && { color: C.text }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.publishBtn, !isValid && styles.publishBtnDisabled]}
            onPress={handlePublish}
            disabled={!isValid}
            accessibilityRole="button"
          >
            <Text style={styles.publishBtnText}>Publicar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showPublishModal} transparent animationType="fade" onRequestClose={() => setShowPublishModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>📝</Text>
            <Text style={styles.modalText}>
              ¿Está seguro de que quiere hacer la publicación de esta noticia?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: C.primary }]}
                onPress={confirmPublish}
              >
                <Text style={styles.modalBtnText}>Sí</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: C.modalButtonGray }]}
                onPress={() => setShowPublishModal(false)}
              >
                <Text style={styles.modalBtnText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showExitModal} transparent animationType="fade" onRequestClose={() => setShowExitModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>🚪</Text>
            <Text style={styles.modalText}>
              ¿Está seguro de que quiere cancelar la publicación de esta noticia?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: C.primaryDark }]}
                onPress={() => {
                  setShowExitModal(false);
                  router.back();
                }}
              >
                <Text style={styles.modalBtnText}>Sí</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: C.success }]}
                onPress={() => setShowExitModal(false)}
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
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: C.surfaceTop,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: C.text },
  headerSpacer: { width: 24 },
  form: { padding: 20, paddingBottom: 100 },
  label: { fontSize: 10, fontWeight: "600", color: C.placeholderText, marginBottom: 6, marginTop: 16, letterSpacing: 1 },
  input: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.chipBg,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: C.text,
  },
  bodyInput: { height: 120 },
  chipsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 41,
    borderRadius: 20.5,
    paddingHorizontal: 18,
    backgroundColor: C.chipBg,
  },
  chipLabel: { fontSize: 14, fontWeight: "600", color: C.text },
  footer: { padding: 20, alignItems: "center" },
  publishBtn: {
    height: 47,
    borderRadius: 23.5,
    width: 225,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  publishBtnDisabled: { opacity: 0.5 },
  publishBtnText: { fontSize: 16, fontWeight: "600", color: C.textInverse },
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
  modalIcon: { fontSize: 32, marginBottom: 12 },
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
