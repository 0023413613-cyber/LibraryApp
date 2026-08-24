import React, { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

import { insertBook } from "../database/bookRepository";

export default function AddBookScreen({
  navigation,
  route,
}: any) {
  const scannedBook =
  route?.params?.scannedBook;

  const [image, setImage] = useState(
    scannedBook?.image ?? ""
  );

  const [title, setTitle] = useState(
    scannedBook?.title ?? ""
  );

  const [author, setAuthor] = useState(
    scannedBook?.author ?? ""
  );

  const [category, setCategory] = useState(
    scannedBook?.category ?? ""
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    author: "",
    category: "",
    image: "",
  });

  const [saving, setSaving] = useState(false);

  // ===============================
  // CHỌN ẢNH
  // ===============================
  const handleChooseImage = useCallback(async () => {
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
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [3, 4],
          quality: 0.7,
          base64: true,
        });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      // Tối ưu ảnh trước khi lưu:
      // - Giới hạn chiều rộng còn 600px
      // - Chuyển sang JPEG
      // - Nén còn khoảng 75%
      // - Không lưu base64 để tránh làm database phình to
      const optimizedImage =
        await ImageManipulator.manipulateAsync(
          asset.uri,
          [
            {
              resize: {
                width: 600,
              },
            },
          ],
          {
            compress: 0.75,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );

      setImage(optimizedImage.uri);

      // Xóa lỗi ảnh ngay khi chọn ảnh
      setErrors((prev) => ({
        ...prev,
        image: "",
      }));
    } catch (error) {
      console.error("Lỗi chọn ảnh:", error);

      Alert.alert(
        "Lỗi",
        "Không thể chọn ảnh."
      );
    }
  }, []);

  // ===============================
  // VALIDATE
  // ===============================
  const validateForm = () => {
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

    return valid;
  };

  // ===============================
  // LƯU SÁCH
  // ===============================
  const handleSave = useCallback(async () => {
  if (saving) {
    return;
  }

  const valid = validateForm();

  if (!valid) {
    return;
  }

  try {
    setSaving(true);

    await insertBook({
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      image,
      status: "available",
    });

    // Web
    // Android / iOS
    setShowSuccessModal(true);

  } catch (error: any) {
    console.error(
      "LỖI INSERT BOOK:",
      error
    );

    if (typeof window !== "undefined") {
      window.alert(
        error?.message ??
        "Không thể thêm sách."
      );
    } else {
      Alert.alert(
        "Lỗi",
        error?.message ??
        "Không thể thêm sách."
      );
    }
  } finally {
    setSaving(false);
  }
}, [
  title,
  author,
  category,
  image,
  navigation,
  saving,
]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          THƯ VIỆN CÁ NHÂN
        </Text>

        <Text style={styles.title}>
          Thêm sách mới
        </Text>

        <Text style={styles.subtitle}>
          Thêm một cuốn sách vào tủ sách
          của bạn
        </Text>
      </View>

      {/* TÊN SÁCH */}
      <Text style={styles.label}>
        Tên sách <Text style={styles.required}>*</Text>
      </Text>

      <TextInput
        style={[
          styles.input,
          errors.title !== "" &&
            styles.inputError,
        ]}
        placeholder="Nhập tên sách"
        placeholderTextColor="#98A2B3"
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
        style={[
          styles.input,
          errors.author !== "" &&
            styles.inputError,
        ]}
        placeholder="Nhập tên tác giả"
        placeholderTextColor="#98A2B3"
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
        style={[
          styles.input,
          errors.category !== "" &&
            styles.inputError,
        ]}
        placeholder="Ví dụ: Tiểu thuyết"
        placeholderTextColor="#98A2B3"
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

      {/* ẢNH */}
      <Text style={styles.label}>
        Ảnh bìa <Text style={styles.required}>*</Text>
      </Text>

      <TouchableOpacity
        style={[
          styles.imagePicker,
          errors.image !== "" &&
            styles.imagePickerError,
        ]}
        activeOpacity={0.85}
        onPress={handleChooseImage}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.preview}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <View style={styles.plusCircle}>
              <Text style={styles.plus}>
                +
              </Text>
            </View>

            <Text style={styles.imageTitle}>
              Chọn ảnh bìa
            </Text>

            <Text style={styles.imageSubtitle}>
              Nhấn để chọn ảnh từ máy
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {errors.image !== "" && (
        <Text style={styles.errorText}>
          {errors.image}
        </Text>
      )}

      <TouchableOpacity
        style={styles.scanButton}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate("ScanISBN")
        }
      >
        <Text style={styles.scanButtonText}>
          📷 Quét mã ISBN
        </Text>
      </TouchableOpacity>

      {/* LƯU */}
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
            Lưu sách
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>

            <Text style={styles.successTitle}>
              Thêm sách thành công
            </Text>

            <Text style={styles.successMessage}>
              Sách đã được thêm vào tủ sách của bạn.
            </Text>

            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.replace("BookList");
            }}
            >
              <Text style={styles.successButtonText}>
                Đã hiểu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* HỦY */}
      <TouchableOpacity
        style={styles.cancelButton}
        activeOpacity={0.8}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>
          Hủy
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 24,
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
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: "#667085",
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#344054",
    marginBottom: 8,
    marginTop: 16,
  },

  required: {
    color: "#D92D20",
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

  imagePicker: {
    height: 280,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 4,
  },

  imagePickerError: {
    borderColor: "#D92D20",
    backgroundColor: "#FFFBFA",
  },

  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  plusCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EEF0FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  plus: {
    color: "#5146E5",
    fontSize: 32,
    lineHeight: 36,
  },

  imageTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#344054",
  },

  imageSubtitle: {
    fontSize: 14,
    color: "#98A2B3",
    marginTop: 5,
  },

  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  saveButton: {
    height: 56,
    borderRadius: 15,
    backgroundColor: "#5146E5",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  savingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  scanButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#EEF0FF",
    borderWidth: 1,
    borderColor: "#5146E5",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },

  scanButtonText: {
    color: "#5146E5",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  successModal: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },

  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E8F8EF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  successIconText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#12B76A",
  },

  successTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#172033",
  },

  successMessage: {
    fontSize: 15,
    color: "#667085",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },

  successButton: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    backgroundColor: "#5146E5",
    justifyContent: "center",
    alignItems: "center",
  },

  successButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});