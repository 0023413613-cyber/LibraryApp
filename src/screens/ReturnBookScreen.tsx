import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import {
  getBorrowingBooks,
  returnBook,
} from "../database/borrowRepository";

export default function ReturnBookScreen() {
  const [books, setBooks] = useState<any[]>([]);

  async function loadData() {
    try {
      const data = await getBorrowingBooks();
      setBooks(data as any[]);
    } catch (error) {
      console.log(error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function handleReturn(item: any) {
    Alert.alert(
      "Xác nhận",
      `Trả sách "${item.title}"?`,
      [
        {
          text: "Huỷ",
          style: "cancel",
        },
        {
          text: "Trả",
          onPress: async () => {
            try {
        await returnBook(item.id, item.bookId);
          Alert.alert(
            "Thành công",
            "Đã trả sách."
          );

        
            loadData();
            } catch (error) {
              console.log(error);
              Alert.alert(
                "Lỗi",
                "Không thể trả sách."
              );
            }
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Không có sách đang mượn
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>

            <Text>Người mượn: {item.borrower}</Text>

            <Text>SĐT: {item.phone}</Text>

            <Text>Ngày mượn: {item.borrowDate}</Text>

            <Text>Hạn trả: {item.dueDate}</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => handleReturn(item)}
            >
              <Text style={styles.buttonText}>
                Trả sách
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
  },

  card: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  button: {
    marginTop: 10,
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  empty: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 16,
  },
});