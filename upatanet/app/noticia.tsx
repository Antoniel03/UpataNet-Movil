import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/upatanet-theme";
import { useNoticias } from "@/src/hooks/useNoticias";
import type { Noticia } from "@/src/data/noticiasStore";

const C = Colors.light;

export default function NoticiaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, likeNoticia, dislikeNoticia } = useNoticias();
  const [noticia, setNoticia] = useState<Noticia | null>(null);

  useEffect(() => {
    getById(Number(id)).then(setNoticia);
  }, [id, getById]);

  if (!noticia) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Noticia no encontrada</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.detailCard}>
          <Text style={styles.title}>{noticia.titulo}</Text>
          <Text style={styles.bodyText}>{noticia.descripcion}</Text>

          <View style={styles.interactionRow}>
            <TouchableOpacity
              style={styles.reactionBtn}
              onPress={async () => {
                await likeNoticia(noticia.id);
                const updated = await getById(noticia.id);
                if (updated) setNoticia(updated);
              }}
            >
              <Ionicons name="thumbs-up-outline" size={24} color={C.primary} />
              <Text style={styles.reactionText}>{String(noticia.likes).padStart(2, "0")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reactionBtn}
              onPress={async () => {
                await dislikeNoticia(noticia.id);
                const updated = await getById(noticia.id);
                if (updated) setNoticia(updated);
              }}
            >
              <Ionicons name="thumbs-down-outline" size={24} color={C.primary} />
              <Text style={styles.reactionText}>{String(noticia.dislikes).padStart(2, "0")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: C.surfaceTop,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: C.text,
  },
  headerSpacer: {
    width: 28,
  },
  content: {
    paddingHorizontal: 20,
  },
  detailCard: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: C.chipBg,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: C.primary,
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 15,
    color: C.text,
    lineHeight: 22,
    marginBottom: 30,
  },
  interactionRow: {
    flexDirection: "row",
    gap: 30,
  },
  reactionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reactionText: {
    fontSize: 16,
    fontWeight: "600",
    color: C.primary,
  },
});
