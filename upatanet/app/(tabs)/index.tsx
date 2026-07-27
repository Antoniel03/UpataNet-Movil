import NewsCard from "@/components/newsCard";
import { Colors } from "@/constants/theme";
import { CATEGORIES } from "@/data/categories";
import { useNoticias } from "@/src/hooks/useNoticias";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const C = Colors.light;
const BOTTOM_BAR_HEIGHT = 80;

function categoryInfo(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export default function HomeScreen() {
  const router = useRouter();
  const { noticias } = useNoticias();

  const scrollY = useRef(new Animated.Value(0)).current;
  const diffClamp = Animated.diffClamp(scrollY, 0, BOTTOM_BAR_HEIGHT);
  const translateY = diffClamp.interpolate({
    inputRange: [0, BOTTOM_BAR_HEIGHT],
    outputRange: [0, BOTTOM_BAR_HEIGHT],
  });

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
            onPress={() => router.push("/publicar")}
          >
            <Ionicons name="arrow-up" size={20} color={C.textInverse} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="pencil" size={20} color={C.textInverse} />
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
          const cat = categoryInfo(item.category);
          return (
            <NewsCard
              key={item.id}
              title={item.title}
              snippet={item.snippet}
              date={item.date}
              category={cat.label}
              categoryIcon={cat.icon as keyof typeof Ionicons.glyphMap}
              titleColor={cat.color}
              onPress={() => router.push({ pathname: "/noticia", params: { id: item.id } })}
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
});
