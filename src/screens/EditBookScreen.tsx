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
  Platform,
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
    useState<
      "available" | "borrowed"
    >("available");
  const [errors, setErrors] = useState({
    title: "",
    author: "",
    category: "",
    image: "",
  });

  const [saving, setSaving] = useState(false);
  // ===============================
  // TẢI SÁCH
  // ===============================
  const loadBook = useCallback(
    async () => {
      if (!bookId) {
        setLoading(false);
        return;
      }

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
        console.error(
          "Lỗi tải sách:",
          error
        );

        Alert.alert(
          "Lỗi",
          "Không thể tải dữ liệu sách."
        );
      } finally {
        setLoading(false);
      }
    },
    [bookId, navigation]
  );

  useFocusEffect(
    useCallback(() => {
      loadBook();
    }, [loadBook])
  );

  // ===============================
  // CHỌN ẢNH MỚI
  // ===============================
  const pickImage =
    async () => {
      try {
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
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [3, 4],
              quality: 0.7,
              base64: true,
            }
          );

        if (result.canceled) {
          return;
        }

        const asset =
          result.assets[0];

        if (asset.base64) {
          const mimeType =
            asset.mimeType ??
            "image/jpeg";

          const imageData =
            `data:${mimeType};base64,${asset.base64}`;

          setImage(imageData);
          setErrors((prev) => ({
            ...prev,
            image: "",
          }));

        } else {
          setImage(asset.uri);

          setErrors((prev) => ({
            ...prev,
            image: "",
          }));
        }
      } catch (error) {
        console.error(
          "Lỗi chọn ảnh:",
          error
        );

        Alert.alert(
          "Lỗi",
          "Không thể chọn ảnh."
        );
      }
    };

  // ===============================
  // LƯU THAY ĐỔI
  // ===============================
  const handleSave = async () => {
  if (!bookId || saving) {
    return;
  }

  const newErrors = {
    title: "",
    author: "",
    category: "",
    image: "",
  };

  let valid = true;

  if (title.trim() === "") {
    newErrors.title = "Vui lòng nhập tên sách.";
    valid = false;
  }

  if (author.trim() === "") {
    newErrors.author = "Vui lòng nhập tên tác giả.";
    valid = false;
  }

  if (category.trim() === "") {
    newErrors.category = "Vui lòng nhập thể loại.";
    valid = false;
  }

  if (image === "") {
    newErrors.image = "Vui lòng chọn ảnh bìa.";
    valid = false;
  }

  setErrors(newErrors);

  if (!valid) {
    return;
  }

  try {
    setSaving(true);

    const updatedBook: Book = {
      id: bookId,
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      image,
      status,
    };

    await updateBook(updatedBook);

    if (Platform.OS === "web") {
      window.alert("Cập nhật sách thành công.");
      navigation.goBack();
    } else {
      Alert.alert(
        "Thành công",
        "Cập nhật sách thành công.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  } catch (error) {
    console.error(
      "Lỗi cập nhật:",
      error
    );

    Alert.alert(
      "Lỗi",
      "Không thể cập nhật sách."
    );
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <View
        style={styles.loading}
      >
        <ActivityIndicator
          size="large"
          color="#5146E5"
        />
      </View>
    );
  }

  if (!bookId) {
    return (
      <View
        style={styles.loading}
      >
        <Text>
          Không có thông tin sách.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          QUẢN LÝ SÁCH
        </Text>

        <Text style={styles.title}>
          Chỉnh sửa sách
        </Text>

        <Text style={styles.subtitle}>
          Cập nhật thông tin và ảnh bìa
        </Text>
      </View>

      {/* ẢNH BÌA */}
      <Text style={styles.label}>
        Ảnh bìa
      </Text>

      <TouchableOpacity
        style={[
          styles.imageBox,
          errors.image !== "" &&
            styles.imageBoxError,
        ]}
        activeOpacity={0.9}
        onPress={pickImage}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
          />
        ) : (
          <View
            style={styles.imagePlaceholder}
          >
            <Text
              style={styles.plus}
            >
              +
            </Text>

            <Text
              style={
                styles.placeholderText
              }
            >
              Chọn ảnh bìa
            </Text>
          </View>
        )}

        <View
          style={styles.changeImage}
        >
          <Text
            style={styles.changeImageText}
          >
            Đổi ảnh
          </Text>
        </View>
      </TouchableOpacity>

      {errors.image !== "" && (
        <Text style={styles.errorText}>
          {errors.image}
        </Text>
      )}

      {/* TÊN */}
      <Text style={styles.label}>
        Tên sách <Text style={styles.required}>*</Text>
      </Text>

      <TextInput
        placeholder="Tên sách"
        placeholderTextColor="#98A2B3"
        style={[
          styles.input,
          errors.title !== "" &&
            styles.inputError,
        ]}
        value={title}
        onChangeText={(text) => {
          setTitle(text);

          if (text.trim() !== "") {
            setErrors((prev) => ({
              ...prev,
              title: "",
            }));
          }
        }}
      />

      {errors.title !== "" && (
        <Text style={styles.errorText}>
          {errors.title}
        </Text>
      )}

      {/* TÁC GIẢ */}
      <Text style={styles.label}>
          Tác giả <Text style={styles.required}>*</Text>
        </Text>

        <TextInput
          placeholder="Tác giả"
          placeholderTextColor="#98A2B3"
          style={[
            styles.input,
            errors.author !== "" &&
              styles.inputError,
          ]}
          value={author}
          onChangeText={(text) => {
            setAuthor(text);

            if (text.trim() !== "") {
              setErrors((prev) => ({
                ...prev,
                author: "",
              }));
            }
          }}
        />

        {errors.author !== "" && (
          <Text style={styles.errorText}>
            {errors.author}
          </Text>
        )}

      {/* THỂ LOẠI */}
      <Text style={styles.label}>
        Thể loại <Text style={styles.required}>*</Text>
      </Text>

      <TextInput
        placeholder="Thể loại"
        placeholderTextColor="#98A2B3"
        style={[
          styles.input,
          errors.category !== "" &&
            styles.inputError,
        ]}
        value={category}
        onChangeText={(text) => {
          setCategory(text);

          if (text.trim() !== "") {
            setErrors((prev) => ({
              ...prev,
              category: "",
            }));
          }
        }}
      />

      {errors.category !== "" && (
        <Text style={styles.errorText}>
          {errors.category}
        </Text>
      )}
      {/* NÚT LƯU */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          saving && styles.saveButtonDisabled,
        ]}
        activeOpacity={0.85}
        disabled={saving}
        onPress={handleSave}
      >
        {saving ? (
          <View style={styles.savingContent}>
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

            <Text style={styles.saveButtonText}>
              Đang lưu...
            </Text>
          </View>
        ) : (
          <Text style={styles.saveButtonText}>
            Lưu thay đổi
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        activeOpacity={0.8}
        onPress={() =>
          navigation.goBack()
        }
      >
        <Text
          style={styles.cancelButtonText}
        >
          Hủy
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
    backgroundColor: "#F6F8FC",
  },

  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 20,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: "#5146E5",
    marginBottom: 8,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#172033",
  },

  subtitle: {
    fontSize: 15,
    color: "#667085",
    marginTop: 6,
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#344054",
    marginTop: 16,
    marginBottom: 8,
  },

  imageBox: {
    height: 300,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  plus: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EEF0FF",
    color: "#5146E5",
    fontSize: 32,
    textAlign: "center",
    lineHeight: 48,
  },

  placeholderText: {
    marginTop: 10,
    color: "#667085",
    fontWeight: "600",
  },

  changeImage: {
    position: "absolute",
    right: 14,
    bottom: 14,
    backgroundColor:
      "rgba(23,32,51,0.82)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  changeImageText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  input: {
    height: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#172033",
  },

  saveButton: {
    height: 56,
    borderRadius: 15,
    backgroundColor: "#5146E5",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  cancelButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  cancelButtonText: {
    color: "#475467",
    fontSize: 16,
    fontWeight: "600",
  },
  required: {
  color: "#D92D20",
  },

  inputError: {
    borderColor: "#D92D20",
    backgroundColor: "#FFFBFA",
  },

  errorText: {
    color: "#D92D20",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 2,
    fontWeight: "500",
  },

  imageBoxError: {
    borderColor: "#D92D20",
    backgroundColor: "#FFFBFA",
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  savingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});