import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Book } from "../models/Book";

interface Props {
  book: Book;
  onPress: (book: Book) => void;
  onLongPress?: (book: Book) => void;

  selectionMode?: boolean;
  selected?: boolean;
  onSelect?: (book: Book) => void;
}

function BookCard({
  book,
  onPress,
  onLongPress,
  selectionMode = false,
  selected = false,
  onSelect,
}: Props) {
  const isAvailable = book.status === "available";

  const handlePress = () => {
    if (selectionMode) {
      onSelect?.(book);
      return;
    }

    onPress(book);
  };

  const handleLongPress = () => {
    if (!selectionMode) {
      onLongPress?.(book);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[
        styles.container,
        selected && styles.selectedContainer,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={450}
    >
      {/* Checkbox */}
      {selectionMode && (
        <View
          style={[
            styles.checkbox,
            selected && styles.checkboxSelected,
          ]}
        >
          {selected && (
            <Text style={styles.checkmark}>
              ✓
            </Text>
          )}
        </View>
      )}

      {/* Ảnh */}
      <Image
        source={
          book.image
            ? { uri: book.image }
            : undefined
        }
        style={styles.image}
      />

      {/* Nội dung */}
      <View style={styles.content}>
        <Text
          style={styles.title}
          numberOfLines={2}
        >
          {book.title}
        </Text>

        <Text
          style={styles.author}
          numberOfLines={1}
        >
          {book.author}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.category}>
            <Text
              style={styles.categoryText}
              numberOfLines={1}
            >
              {book.category}
            </Text>
          </View>

          <View
            style={[
              styles.status,
              {
                backgroundColor: isAvailable
                  ? "#EAF8F0"
                  : "#FFF4E5",
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isAvailable
                    ? "#16A34A"
                    : "#F59E0B",
                },
              ]}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color: isAvailable
                    ? "#15803D"
                    : "#D97706",
                },
              ]}
            >
              {isAvailable
                ? "Có sẵn"
                : "Đang mượn"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(BookCard);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 12,

    marginBottom: 12,

    borderWidth: 1,
    borderColor: "#E8EAF0",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  selectedContainer: {
    borderColor: "#4F46E5",
    borderWidth: 2,
    backgroundColor: "#F8F7FF",
  },

  checkbox: {
    width: 26,
    height: 26,

    borderRadius: 8,

    borderWidth: 2,
    borderColor: "#CBD5E1",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 10,
  },

  checkboxSelected: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  image: {
    width: 76,
    height: 108,

    borderRadius: 12,

    backgroundColor: "#EEF0F5",
  },

  content: {
    flex: 1,

    marginLeft: 14,

    minHeight: 108,

    justifyContent: "space-between",
  },

  title: {
    fontSize: 17,
    fontWeight: "700",

    color: "#172033",

    lineHeight: 23,
  },

  author: {
    marginTop: 4,

    color: "#7A8496",

    fontSize: 14,
  },

  bottomRow: {
    flexDirection: "row",

    justifyContent: "space-between",
    alignItems: "center",

    marginTop: 10,
  },

  category: {
    maxWidth: "48%",

    backgroundColor: "#EEF2FF",

    borderRadius: 8,

    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  categoryText: {
    color: "#4F46E5",

    fontWeight: "600",

    fontSize: 12,
  },

  status: {
    flexDirection: "row",

    alignItems: "center",

    borderRadius: 8,

    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  statusDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    marginRight: 5,
  },

  statusText: {
    fontSize: 12,

    fontWeight: "700",
  },
});