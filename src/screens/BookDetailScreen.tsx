import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";

import { Book } from "../models/Book";
import {
  getBookById,
  deleteBook,
} from "../database/bookRepository";

export default function BookDetailScreen({
  route,
  navigation,
}: any) {

  const { bookId } = route.params;

  const [book, setBook] = useState<Book | null>(null);

  const [loading, setLoading] = useState(true);

  const loadBook = useCallback(async () => {
    try {
      const data = await getBookById(bookId);

      if (data) {
        setBook(data);
      } else {
        Alert.alert(
          "Thông báo",
          "Không tìm thấy sách."
        );

        navigation.goBack();
      }
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Lỗi",
        "Không thể tải dữ liệu."
      );
    } finally {
      setLoading(false);
    }
  }, [bookId, navigation]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2196F3"
        />
      </View>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>

      <Image
        source={{ uri: book.image }}
        style={styles.image}
      />

      <View style={styles.infoContainer}>

        <Text style={styles.title}>
          {book.title}
        </Text>

        <Text style={styles.label}>
          Tác giả
        </Text>

        <Text style={styles.value}>
          {book.author}
        </Text>

        <Text style={styles.label}>
          Thể loại
        </Text>

        <Text style={styles.value}>
          {book.category}
        </Text>

        <Text style={styles.label}>
          Trạng thái
        </Text>

        <Text
          style={[
            styles.status,
            {
              color:
                book.status === "available"
                  ? "#2E7D32"
                  : "#D32F2F",
            },
          ]}
        >
          {book.status === "available"
            ? "Có sẵn"
            : "Đang cho mượn"}
        </Text>
                <View style={styles.buttonContainer}>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              navigation.navigate("EditBook", {
                bookId: book.id,
              })
            }
          >
            <Text style={styles.buttonText}>
              Chỉnh sửa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.borrowButton}
            onPress={() =>
              navigation.navigate("BorrowBook", {
                bookId: book.id,
              })
            }
          >
            <Text style={styles.buttonText}>
              Cho mượn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                "Xóa sách",
                "Bạn có chắc muốn xóa sách này?",
                [
                  {
                    text: "Hủy",
                    style: "cancel",
                  },
                  {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await deleteBook(book.id);

                        Alert.alert(
                          "Thành công",
                          "Đã xóa sách."
                        );

                        navigation.goBack();
                      } catch (error) {
                        console.log(error);

                        Alert.alert(
                          "Lỗi",
                          "Không thể xóa sách."
                        );
                      }
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.buttonText}>
              Xóa sách
            </Text>
          </TouchableOpacity>

        </View>

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },

  image: {
    width: "100%",
    height: 350,
    resizeMode: "cover",
  },

  infoContainer: {
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#222",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 10,
  },

  value: {
    fontSize: 18,
    color: "#222",
    marginTop: 5,
  },

  status: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },

  buttonContainer: {
    marginTop: 35,
    gap: 15,
  },

  editButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
  },

  borrowButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
  },

  deleteButton: {
    backgroundColor: "#E53935",
    padding: 15,
    borderRadius: 10,
  },

  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 17,
  },

});