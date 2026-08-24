import React, {
  useCallback,
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
  Platform,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { Book } from "../models/Book";

import {
  getBookById,
  deleteBook,
} from "../database/bookRepository";

export default function BookDetailScreen({
  route,
  navigation,
}: any) {
  const bookId = route.params?.bookId;

  const [book, setBook] =
    useState<Book | null>(null);

  const [loading, setLoading] =
    useState(true);

  // =========================
  // LOAD SÁCH
  // =========================
  const loadBook =
    useCallback(async () => {
      if (!bookId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const data =
          await getBookById(bookId);

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
    }, [bookId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadBook();
    }, [loadBook])
  );

  // =========================
  // XÓA SÁCH
  // =========================
  const handleDelete =
    async () => {
      if (!book) {
        return;
      }

      // Không cho xóa sách đang được mượn
      if (
        book.status === "borrowed"
      ) {
        if (Platform.OS === "web") {
          window.alert(
            "Sách đang được mượn, không thể xóa."
          );
        } else {
          Alert.alert(
            "Không thể xóa",
            "Sách đang được mượn. Vui lòng trả sách trước khi xóa."
          );
        }

        return;
      }

      const performDelete =
        async () => {
          try {
            await deleteBook(
              book.id
            );

            if (Platform.OS === "web") {
              window.alert(
                "Đã xóa sách thành công."
              );
            } else {
              Alert.alert(
                "Thành công",
                "Đã xóa sách."
              );
            }

            navigation.goBack();
          } catch (error) {
            console.error(
              "Lỗi xóa sách:",
              error
            );

            if (
              Platform.OS === "web"
            ) {
              window.alert(
                "Không thể xóa sách."
              );
            } else {
              Alert.alert(
                "Lỗi",
                "Không thể xóa sách."
              );
            }
          }
        };

      // =========================
      // WEB
      // =========================
      if (Platform.OS === "web") {
        const confirmed =
          window.confirm(
            `Bạn có chắc muốn xóa sách "${book.title}" không?`
          );

        if (confirmed) {
          await performDelete();
        }

        return;
      }

      // =========================
      // ANDROID / IOS
      // =========================
      Alert.alert(
        "Xóa sách",
        `Bạn có chắc muốn xóa sách "${book.title}" không?`,
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Xóa",
            style: "destructive",
            onPress:
              performDelete,
          },
        ]
      );
    };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#4F46E5"
        />

        <Text style={styles.loadingText}>
          Đang tải thông tin...
        </Text>
      </View>
    );
  }

  // =========================
  // KHÔNG TÌM THẤY SÁCH
  // =========================
  if (!book) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <Text>
          Không tìm thấy sách.
        </Text>
      </View>
    );
  }

  // =========================
  // KIỂM TRA TRẠNG THÁI
  // =========================
  const isAvailable =
    book.status === "available";

  const isBorrowed =
    book.status === "borrowed";

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* =========================
          ẢNH BÌA
      ========================== */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: book.image,
          }}
          style={styles.image}
        />
      </View>

      {/* =========================
          THÔNG TIN
      ========================== */}
      <View style={styles.content}>
        <Text style={styles.eyebrow}>
          THÔNG TIN SÁCH
        </Text>

        <Text style={styles.title}>
          {book.title}
        </Text>

        {/* =========================
            TRẠNG THÁI
        ========================== */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                isAvailable
                  ? "#ECFDF3"
                  : "#FFF7ED",
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  isAvailable
                    ? "#16A34A"
                    : "#F97316",
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color: isAvailable
                  ? "#15803D"
                  : "#C2410C",
              },
            ]}
          >
            {isAvailable
              ? "Có sẵn"
              : "Đang cho mượn"}
          </Text>
        </View>

        {/* =========================
            THÔNG TIN SÁCH
        ========================== */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Tác giả
            </Text>

            <Text style={styles.infoValue}>
              {book.author}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Thể loại
            </Text>

            <Text style={styles.infoValue}>
              {book.category}
            </Text>
          </View>
        </View>

        {/* =========================
            NÚT CHỈNH SỬA
        ========================== */}
        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate(
              "EditBook",
              {
                bookId: book.id,
              }
            )
          }
        >
          <Text style={styles.buttonText}>
            Chỉnh sửa sách
          </Text>
        </TouchableOpacity>

        {/* =========================
            NÚT CHO MƯỢN
            Chỉ hiển thị khi sách có sẵn
        ========================== */}
        {isAvailable && (
          <TouchableOpacity
            style={styles.borrowButton}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate(
                "BorrowBook",
                {
                  bookId: book.id,
                }
              )
            }
          >
            <Text style={styles.buttonText}>
              Cho mượn sách
            </Text>
          </TouchableOpacity>
        )}

        {/* =========================
            NÚT TRẢ SÁCH
            Chỉ hiển thị khi sách đang được mượn
        ========================== */}
        {isBorrowed && (
          <TouchableOpacity
            style={styles.returnButton}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate(
                "ReturnBook",
                {
                  bookId: book.id,
                }
              )
            }
          >
            <Text style={styles.buttonText}>
              Trả sách
            </Text>
          </TouchableOpacity>
        )}

        {/* =========================
            NÚT XÓA
        ========================== */}
        <TouchableOpacity
          style={styles.deleteButton}
          activeOpacity={0.85}
          onPress={handleDelete}
        >
          <Text
            style={styles.deleteButtonText}
          >
            Xóa sách
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// =====================================================
// STYLE
// =====================================================

const styles = StyleSheet.create({
  // =========================
  // LOADING
  // =========================
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FB",
  },

  loadingText: {
    marginTop: 12,
    color: "#7A8499",
  },

  // =========================
  // CONTAINER
  // =========================
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  // =========================
  // IMAGE
  // =========================
  imageContainer: {
    height: 360,
    backgroundColor: "#E9ECF3",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  // =========================
  // CONTENT
  // =========================
  content: {
    padding: 20,
    paddingBottom: 50,
  },

  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: "#4F46E5",
    marginBottom: 7,
  },

  title: {
    fontSize: 30,
    lineHeight: 37,
    fontWeight: "700",
    color: "#172033",
    marginBottom: 14,
  },

  // =========================
  // STATUS
  // =========================
  statusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginBottom: 20,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },

  statusText: {
    fontSize: 13,
    fontWeight: "700",
  },

  // =========================
  // INFO CARD
  // =========================
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#E8EBF1",
    marginBottom: 22,
  },

  infoRow: {
    paddingVertical: 16,
    gap: 5,
  },

  infoLabel: {
    fontSize: 13,
    color: "#8A94A6",
    fontWeight: "600",
  },

  infoValue: {
    fontSize: 16,
    color: "#273247",
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF0F4",
  },

  // =========================
  // EDIT BUTTON
  // =========================
  editButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  // =========================
  // BORROW BUTTON
  // =========================
  borrowButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  // =========================
  // RETURN BUTTON
  // =========================
  returnButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  // =========================
  // DELETE BUTTON
  // =========================
  deleteButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    alignItems: "center",
    justifyContent: "center",
  },

  // =========================
  // TEXT
  // =========================
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  deleteButtonText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "700",
  },
});