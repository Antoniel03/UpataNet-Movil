import NewsCard from "@/components/newsCard";
import { Colors } from "@/constants/theme";
import { CATEGORIES } from "@/data/categories";
import { useNoticias } from "@/src/hooks/useNoticias";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUsuario } from "@/src/hooks/use-usuario";

const C = Colors.light;
const BOTTOM_BAR_HEIGHT = 80;

function categoryInfo(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export default function HomeScreen() {
  const router = useRouter();
  const { noticias, loadNoticias } = useNoticias();
  const { isRegistered } = useUsuario();
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const diffClamp = Animated.diffClamp(scrollY, 0, BOTTOM_BAR_HEIGHT);
  const translateY = diffClamp.interpolate({
    inputRange: [0, BOTTOM_BAR_HEIGHT],
    outputRange: [0, BOTTOM_BAR_HEIGHT],
  });

  const onRefresh = useCallback(async () => {
    await loadNoticias();
  }, [loadNoticias]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require("../../assets/img/min-icon.png")} />
          <Text style={styles.headerTitle}>Upatanet</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              if (isRegistered) {
                router.push("/publicar");
              } else {
                setShowRegisterModal(true);
              }
            }}
          >
            <Ionicons name="arrow-up" size={20} color={C.textInverse} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onRefresh}>
            <Ionicons name="reload-outline" size={20} color={C.textInverse} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: Platform.OS !== "web" },
        )}
        scrollEventThrottle={16}
      >
        {noticias.map((item) => {
          const cat = categoryInfo(item.categoria ?? "alertas");
          const snippet =
            item.descripcion.length > 60
              ? item.descripcion.slice(0, 57) + "..."
              : item.descripcion;
          return (
            <NewsCard
              key={item.id}
              title={item.titulo}
              snippet={snippet}
              date={item.datetime ?? ""}
              category={cat.label}
              categoryIcon={cat.icon as keyof typeof Ionicons.glyphMap}
              titleColor={cat.color}
              onPress={() =>
                router.push({
                  pathname: "/noticia",
                  params: { id: String(item.id) },
                })
              }
            />
          );
        })}
      </Animated.ScrollView>

      <Animated.View
        style={[styles.bottomBar, { transform: [{ translateY }] }]}
      >
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/(tabs)")}
        >
          <Ionicons name="home" size={24} color={C.primary} />
          <Text style={[styles.tabText, { color: C.primary }]}>Noticias</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/(tabs)/mapa")}
        >
          <Ionicons name="map-outline" size={24} color={C.placeholderText} />
          <Text style={styles.tabText}>Mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/(tabs)/alarma")}
        >
          <Ionicons
            name="chatbubble-outline"
            size={24}
            color={C.placeholderText}
          />
          <Text style={styles.tabText}>Alarma</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/(tabs)/configuracion")}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={C.placeholderText}
          />
          <Text style={styles.tabText}>Configuración</Text>
        </TouchableOpacity>
      </Animated.View>
      <Modal
        visible={showRegisterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRegisterModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              Debe registrarse antes de publicar una noticia
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: C.primary }]}
                onPress={() => {
                  setShowRegisterModal(false);
                  router.push("/(tabs)/configuracion");
                }}
              >
                <Text style={styles.modalBtnText}>Ir a configuración</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: C.modalButtonGray }]}
                onPress={() => setShowRegisterModal(false)}
              >
                <Text style={styles.modalBtnText}>Cerrar</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  logoContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: C.text },
  headerActions: { flexDirection: "row", gap: 10 },
  iconButton: {
    backgroundColor: C.primary,
    padding: 8,
    borderRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: BOTTOM_BAR_HEIGHT + 20,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_BAR_HEIGHT,
    backgroundColor: C.background,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: C.chipBg,
    paddingBottom: 20,
  },
  tabItem: { alignItems: "center" },
  tabText: { fontSize: 12, marginTop: 4, color: C.placeholderText },
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
    paddingHorizontal: 20,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnText: { fontSize: 14, fontWeight: "600", color: C.textInverse },
});
