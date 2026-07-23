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
}

function BookCard({
  book,
  onPress,
}: Props) {
  const isAvailable =
    book.status === "available";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={() => onPress(book)}
    >
      <Image
        source={{ uri: book.image }}
        style={styles.image}
      />

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
            <Text style={styles.categoryText}>
              {book.category}
            </Text>
          </View>

          <View
            style={[
              styles.status,
              {
                backgroundColor:
                  isAvailable
                    ? "#E8F5E9"
                    : "#FFF3E0",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: isAvailable
                    ? "#2E7D32"
                    : "#EF6C00",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 18,

    padding: 12,

    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 4,
  },

  image: {
    width: 78,
    height: 110,
    borderRadius: 12,

    backgroundColor: "#EEE",
  },

  content: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "space-between",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },

  author: {
    marginTop: 5,
    color: "#777",
    fontSize: 15,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  category: {
    backgroundColor: "#EEF4FF",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  categoryText: {
    color: "#2962FF",
    fontWeight: "600",
    fontSize: 13,
  },

  status: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  statusText: {
    fontWeight: "700",
    fontSize: 13,
  },
});