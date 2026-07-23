import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import BookCard from "../components/BookCard";
import { Book } from "../models/Book";
import { getAllBooks } from "../database/bookRepository";

export default function BookListScreen({
  navigation,
}: any) {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");

  const loadBooks = useCallback(async () => {
    try {
      const data = await getAllBooks();
      setBooks(data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

  const handleBookPress = (book: Book) => {
    navigation.navigate("BookDetail", {
      bookId: book.id,
    });
  };

  const filteredBooks = useMemo(() => {
    return books.filter(
      (book) =>
        book.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        book.author
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        book.category
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [books, search]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        📚 Danh sách sách
      </Text>

      <Text style={styles.subTitle}>
        Tổng số {filteredBooks.length} quyển
      </Text>

      <TextInput
        style={styles.search}
        placeholder="Tìm theo tên, tác giả..."
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddBook")}
      >
        <Text style={styles.addButtonText}>
          + Thêm sách
        </Text>
      </TouchableOpacity>

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={handleBookPress}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>Chưa có sách.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 16,
  },

  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
  },

  subTitle: {
    color: "#666",
    marginTop: 5,
    marginBottom: 20,
  },

  search: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 15,
  },

  addButton: {
    backgroundColor: "#2196F3",
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  addButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },

  empty: {
    alignItems: "center",
    marginTop: 80,
  },
});