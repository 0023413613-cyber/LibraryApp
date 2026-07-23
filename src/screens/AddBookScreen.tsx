import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { insertBook } from "../database/bookRepository";

export default function AddBookScreen({
  navigation,
}: any) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");

  // Chọn ảnh
  const handleChooseImage = useCallback(async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Thông báo",
        "Bạn cần cấp quyền truy cập thư viện ảnh."
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  }, []);

  // Lưu sách
  const handleSave = useCallback(async () => {
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
      await insertBook({
        title,
        author,
        category,
        image,
        status: "available",
      });

      Alert.alert(
        "Thành công",
        "Đã thêm sách thành công."
      );

      navigation.goBack();
    } catch (error: any) {
      console.log(error);

      Alert.alert(
        "Lỗi",
        error?.message ?? JSON.stringify(error)
      );
    }
  }, [
    title,
    author,
    category,
    image,
    navigation,
  ]);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.label}>Tên sách</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập tên sách"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Tác giả</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập tác giả"
        value={author}
        onChangeText={setAuthor}
      />

      <Text style={styles.label}>Thể loại</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập thể loại"
        value={category}
        onChangeText={setCategory}
      />

      <Text style={styles.label}>Ảnh bìa</Text>

      <TouchableOpacity
        style={styles.imageButton}
        onPress={handleChooseImage}
      >
        <Text style={styles.imageButtonText}>
          📷 Chọn ảnh
        </Text>
      </TouchableOpacity>

      {image !== "" && (
        <Image
          source={{ uri: image }}
          style={styles.preview}
        />
      )}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>
          Lưu sách
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    padding: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },

  imageButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },

  imageButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },

  preview: {
    width: 170,
    height: 230,
    alignSelf: "center",
    marginTop: 20,
    borderRadius: 10,
  },

  saveButton: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 40,
  },

  saveButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
});