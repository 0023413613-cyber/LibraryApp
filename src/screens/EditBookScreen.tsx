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
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { useFocusEffect } from "@react-navigation/native";

import { Book } from "../models/Book";

import {
  getBookById,
  updateBook,
} from "../database/bookRepository";

export default function EditBookScreen({
  navigation,
  route,
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

  const [loading, setLoading] =
    useState(true);

  const [title, setTitle] =
    useState("");

  const [author, setAuthor] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [image, setImage] =
    useState("");

    const [status, setStatus] =
    useState<"available" | "borrowed">(
        "available"
    );

  const loadBook = useCallback(async () => {
    try {

      const book =
        await getBookById(bookId);

      if (!book) {

        Alert.alert(
          "Thông báo",
          "Không tìm thấy sách."
        );

        navigation.goBack();

        return;
      }

      setTitle(book.title);

      setAuthor(book.author);

      setCategory(book.category);

      setImage(book.image);

      setStatus(book.status);

    } catch (error) {

      Alert.alert(
        "Lỗi",
        "Không thể tải dữ liệu."
      );

    } finally {

      setLoading(false);

    }

  }, [bookId]);

  useFocusEffect(

    useCallback(() => {

      loadBook();

    }, [loadBook])

  );
    const pickImage = async () => {
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (
      title.trim() === "" ||
      author.trim() === "" ||
      category.trim() === ""
    ) {
      Alert.alert(
        "Thông báo",
        "Vui lòng nhập đầy đủ thông tin."
      );
      return;
    }

    if (image === "") {
      Alert.alert(
        "Thông báo",
        "Vui lòng chọn ảnh bìa."
      );
      return;
    }

    try {
      const updatedBook: Book = {
        id: bookId,
        title,
        author,
        category,
        image,
        status,
      };

      await updateBook(updatedBook);

      Alert.alert(
        "Thành công",
        "Cập nhật sách thành công."
      );

      navigation.goBack();
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Lỗi",
        "Không thể cập nhật sách."
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color="#2196F3"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Chỉnh sửa sách
      </Text>

      <TouchableOpacity
        style={styles.imageBox}
        onPress={pickImage}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
          />
        ) : (
          <Text style={styles.imageText}>
            Chọn ảnh bìa
          </Text>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Tên sách"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        placeholder="Tác giả"
        style={styles.input}
        value={author}
        onChangeText={setAuthor}
      />

      <TextInput
        placeholder="Thể loại"
        style={styles.input}
        value={category}
        onChangeText={setCategory}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
      >
        <Text style={styles.buttonText}>
          Lưu thay đổi
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },

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

  imageBox: {
    width: "100%",
    height: 260,
    borderRadius: 20,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",

    overflow: "hidden",

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

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  imageText: {
    color: "#777",
    fontSize: 16,
  },

  input: {
    backgroundColor: "#FFFFFF",

    height: 55,

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
    marginTop: 15,

    height: 58,

    borderRadius: 16,

    backgroundColor: "#2196F3",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#2196F3",
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