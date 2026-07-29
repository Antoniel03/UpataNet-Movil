import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/upatanet-theme";

const C = Colors.light;

interface NewsCardProps {
  title: string;
  snippet: string;
  date: string;
  category: string;
  categoryIcon: keyof typeof Ionicons.glyphMap;
  titleColor: string;
  onPress: () => void;
}

export default function NewsCard({
  title,
  snippet,
  date,
  category,
  categoryIcon,
  titleColor,
  onPress,
}: NewsCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      <Text style={styles.snippet} numberOfLines={2}>
        {snippet}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.date}>Subido el {date}</Text>
        <View style={styles.categoryContainer}>
          <Ionicons name={categoryIcon} size={14} color={titleColor} />
          <Text style={[styles.category, { color: titleColor }]}>
            {category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.chipBg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  snippet: {
    fontSize: 14,
    color: C.text,
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    color: C.placeholderText,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  category: {
    fontSize: 12,
    fontWeight: "600",
  },
});
