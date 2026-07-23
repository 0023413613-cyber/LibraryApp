import React, {
  useCallback,
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { getBookById } from "../database/bookRepository";
import { borrowBook } from "../database/borrowRepository";

export default function BorrowBookScreen({
  route,
  navigation,
}: any) {

  const bookId = route.params?.bookId;
    if (!bookId) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Không có bookId</Text>
      </View>
    );
  }

  const [bookTitle, setBookTitle] =
    useState("");

  const [borrower, setBorrower] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [borrowDate, setBorrowDate] =
    useState(
      new Date().toISOString().split("T")[0]
    );

  const [dueDate, setDueDate] =
    useState("");

  const loadBook = useCallback(async () => {
    const book =
      await getBookById(bookId);

    if (book) {
      setBookTitle(book.title);
    }
  }, [bookId]);

  useFocusEffect(
    useCallback(() => {
      loadBook();
    }, [loadBook])
  );
    const handleBorrow = async () => {
    if (
      borrower.trim() === "" ||
      phone.trim() === "" ||
      dueDate.trim() === ""
    ) {
      Alert.alert(
        "Thông báo",
        "Vui lòng nhập đầy đủ thông tin."
      );
      return;
    }

    try {
      await borrowBook(
        bookId,
        borrower,
        phone,
        borrowDate,
        dueDate
      );

      Alert.alert(
        "Thành công",
        "Cho mượn sách thành công."
      );

      navigation.goBack();
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Lỗi",
        "Không thể cho mượn sách."
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Cho mượn sách
      </Text>

      <View style={styles.bookCard}>
        <Text style={styles.bookLabel}>
          Sách
        </Text>

        <Text style={styles.bookTitle}>
          {bookTitle}
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Tên người mượn"
        value={borrower}
        onChangeText={setBorrower}
      />

      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Ngày mượn"
        value={borrowDate}
        editable={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Hạn trả (YYYY-MM-DD)"
        value={dueDate}
        onChangeText={setDueDate}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleBorrow}
      >
        <Text style={styles.buttonText}>
          Xác nhận cho mượn
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    marginBottom: 25,
  },

  bookCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 18,

    marginBottom: 25,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  bookLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },

  bookTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },

  input: {
    backgroundColor: "#FFFFFF",

    height: 56,

    borderRadius: 15,

    paddingHorizontal: 18,

    fontSize: 16,

    marginBottom: 18,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  button: {
    marginTop: 10,

    height: 58,

    borderRadius: 16,

    backgroundColor: "#43A047",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#43A047",
    shadowOpacity: 0.25,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
  },
});