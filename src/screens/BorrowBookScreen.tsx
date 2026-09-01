import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { getBookById } from "../database/bookRepository";
import { borrowBook } from "../database/borrowRepository";

// =====================================================
// HỖ TRỢ NGÀY DD/MM/YYYY
// =====================================================

const getToday = (): string => {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
};

const normalizeDate = (
  value: string
): string | null => {
  const input = value.trim();

  let year: number;
  let month: number;
  let day: number;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    [year, month, day] =
      input.split("-").map(Number);
  }
  // DD/MM/YYYY
  else if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
    [day, month, year] =
      input.split("/").map(Number);
  } else {
    return null;
  }

  const date = new Date(
    year,
    month - 1,
    day
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(
    2,
    "0"
  )}-${String(day).padStart(
    2,
    "0"
  )}`;
};


// =====================================================
// BORROW BOOK SCREEN
// =====================================================

export default function BorrowBookScreen({
  route,
  navigation,
}: any) {
  const bookId = route.params?.bookId;

  const [bookTitle, setBookTitle] =
    useState("");

  const [borrower, setBorrower] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [borrowDate, setBorrowDate] =
    useState(getToday());

  const [dueDate, setDueDate] =
    useState("");

  const [loadingBook, setLoadingBook] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successVisible, setSuccessVisible] =
    useState(false);

  // ===================================================
  // LOAD THÔNG TIN SÁCH
  // ===================================================

  const loadBook = useCallback(
    async () => {
      if (!bookId) {
        setLoadingBook(false);
        setError("Không có bookId.");
        return;
      }

      try {
        setLoadingBook(true);
        setError("");

        const book =
          await getBookById(bookId);

        if (!book) {
          setError(
            "Không tìm thấy thông tin sách."
          );
          return;
        }

        setBookTitle(book.title);
      } catch (err) {
        console.log(
          "Lỗi tải thông tin sách:",
          err
        );

        setError(
          "Không thể tải thông tin sách."
        );
      } finally {
        setLoadingBook(false);
      }
    },
    [bookId]
  );

  useFocusEffect(
    useCallback(() => {
      loadBook();
    }, [loadBook])
  );

  // ===================================================
  // XÁC NHẬN CHO MƯỢN
  // ===================================================

  const handleBorrow = async () => {
    if (submitting) {
      return;
    }

    const borrowerName =
      borrower.trim();

    const phoneNumber =
      phone.trim();

    const enteredDueDate =
      dueDate.trim();

    // -------------------------------
    // Kiểm tra thông tin bắt buộc
    // -------------------------------

    if (
      borrowerName === "" ||
      phoneNumber === "" ||
      enteredDueDate === ""
    ) {
      setError(
        "Vui lòng nhập đầy đủ thông tin."
      );
      return;
    }

    // -------------------------------
    // Kiểm tra SĐT
    // -------------------------------

    if (!/^[0-9]+$/.test(phoneNumber)) {
      setError(
        "Số điện thoại chỉ được chứa số."
      );
      return;
    }

    if (
      phoneNumber.length < 9 ||
      phoneNumber.length > 11
    ) {
      setError(
        "Số điện thoại phải có từ 9 đến 11 số."
      );
      return;
    }

    // -------------------------------
    // Chuẩn hóa hạn trả
    // -------------------------------

    const normalizedDueDate =
      normalizeDate(enteredDueDate);

    if (!normalizedDueDate) {
      setError(
        "Hạn trả không hợp lệ. Vui lòng nhập YYYY-MM-DD hoặc DD-MM-YYYY."
      );
      return;
    }

    // -------------------------------
    // Không cho hạn trả quá khứ
    // -------------------------------

    const today = getToday();

    if (normalizedDueDate < today) {
      setError(
        `Hạn trả ${enteredDueDate} đã quá hạn. Vui lòng nhập ngày trả từ ${today} trở đi.`
      );
      return;
    }

    // -------------------------------
    // Không cho hạn trả trước ngày mượn
    // -------------------------------

    const normalizedBorrowDate =
      normalizeDate(borrowDate);

    if (
      normalizedBorrowDate &&
      normalizedDueDate <
        normalizedBorrowDate
    ) {
      setError(
        "Hạn trả không được trước ngày mượn."
      );
      return;
    }

    // -------------------------------
    // Gọi database
    // -------------------------------

    try {
      setSubmitting(true);
      setError("");

      await borrowBook(
        bookId,
        borrowerName,
        phoneNumber,
        borrowDate,
        normalizedDueDate
      );

      // QUAN TRỌNG:
      // Không dùng Alert.alert cho thông báo thành công.
      // Hiển thị Modal trực tiếp để chạy ổn định cả trên Web.
      setSuccessVisible(true);
    } catch (err) {
      console.log(
        "Lỗi cho mượn sách:",
        err
      );

      setError(
        "Không thể cho mượn sách. Vui lòng kiểm tra dữ liệu hoặc thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ===================================================
  // BOOK ID LỖI
  // ===================================================

  if (!bookId) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Không có bookId
        </Text>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <Text style={styles.secondaryButtonText}>
            Quay lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          Cho mượn sách
        </Text>

        {/* THÔNG TIN SÁCH */}

        <View style={styles.bookCard}>
          <Text style={styles.bookLabel}>
            Sách
          </Text>

          {loadingBook ? (
            <View style={styles.bookLoading}>
              <ActivityIndicator
                size="small"
                color="#43A047"
              />

              <Text style={styles.loadingText}>
                Đang tải thông tin sách...
              </Text>
            </View>
          ) : (
            <Text
              style={styles.bookTitle}
              numberOfLines={2}
            >
              {bookTitle}
            </Text>
          )}
        </View>

        {/* LỖI */}

        {error !== "" && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxTitle}>
              Không thể thực hiện
            </Text>

            <Text style={styles.errorBoxText}>
              {error}
            </Text>
          </View>
        )}

        {/* NGƯỜI MƯỢN */}

        <TextInput
          style={styles.input}
          placeholder="Tên người mượn"
          value={borrower}
          onChangeText={setBorrower}
          autoCapitalize="words"
          editable={!submitting}
        />

        {/* SỐ ĐIỆN THOẠI */}

        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={11}
          editable={!submitting}
        />

        {/* NGÀY MƯỢN */}

        <TextInput
          style={[
            styles.input,
            styles.disabledInput,
          ]}
          placeholder="Ngày mượn"
          value={borrowDate}
          editable={false}
        />

        {/* HẠN TRẢ */}

        <TextInput
          style={styles.input}
          placeholder="Hạn trả (YYYY-MM-DD)"
          value={dueDate}
          onChangeText={(text) => {
            setDueDate(text);
            setError("");
          }}
          maxLength={10}
          editable={!submitting}
        />

        <Text style={styles.helperText}>
          Hạn trả phải từ ngày {borrowDate} trở đi.
        </Text>

        {/* BUTTON */}

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.button,
            (submitting ||
              loadingBook) &&
              styles.buttonDisabled,
          ]}
          onPress={handleBorrow}
          disabled={
            submitting || loadingBook
          }
        >
          {submitting ? (
            <>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text style={styles.buttonText}>
                Đang xử lý...
              </Text>
            </>
          ) : (
            <Text style={styles.buttonText}>
              Xác nhận cho mượn
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* =================================================
          SUCCESS MODAL
          ================================================= */}

      <Modal
        visible={successVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setSuccessVisible(false)
        }
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>
                ✓
              </Text>
            </View>

            <Text style={styles.successTitle}>
              Cho mượn thành công
            </Text>

            <Text style={styles.successText}>
              Đã tạo phiếu mượn sách thành công.
            </Text>

            <Text
              style={styles.successBook}
              numberOfLines={2}
            >
              {bookTitle}
            </Text>

            <Text style={styles.successDueDate}>
              Hạn trả: {dueDate}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.successButton}
              onPress={() => {
                setSuccessVisible(false);
                navigation.goBack();
              }}
            >
              <Text
                style={styles.successButtonText}
              >
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// =====================================================
// STYLE
// =====================================================

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: "#F5F7FA",
    },

    container: {
      flex: 1,
    },

    content: {
      padding: 20,
      paddingBottom: 40,
    },

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F5F7FA",
      padding: 20,
    },

    title: {
      fontSize: 28,
      fontWeight: "700",
      color: "#222222",
      marginBottom: 25,
    },

    bookCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 18,
      padding: 18,
      marginBottom: 20,
      shadowColor: "#000000",
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
      color: "#888888",
      marginBottom: 8,
    },

    bookTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#222222",
    },

    bookLoading: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 28,
    },

    loadingText: {
      marginLeft: 8,
      fontSize: 14,
      color: "#64748B",
    },

    input: {
      backgroundColor: "#FFFFFF",
      height: 56,
      borderRadius: 15,
      paddingHorizontal: 18,
      fontSize: 16,
      marginBottom: 16,
      shadowColor: "#000000",
      shadowOpacity: 0.05,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 2,
    },

    disabledInput: {
      color: "#64748B",
      backgroundColor: "#F1F5F9",
    },

    helperText: {
      fontSize: 13,
      color: "#64748B",
      marginTop: -8,
      marginBottom: 14,
      marginLeft: 4,
    },

    errorBox: {
      backgroundColor: "#FEF2F2",
      borderWidth: 1,
      borderColor: "#FCA5A5",
      borderRadius: 12,
      padding: 13,
      marginBottom: 16,
    },

    errorBoxTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: "#B91C1C",
      marginBottom: 4,
    },

    errorBoxText: {
      fontSize: 14,
      lineHeight: 20,
      color: "#991B1B",
    },

    errorTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#DC2626",
      marginBottom: 20,
    },

    secondaryButton: {
      backgroundColor: "#64748B",
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 10,
    },

    secondaryButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 15,
    },

    button: {
      marginTop: 5,
      minHeight: 58,
      borderRadius: 16,
      backgroundColor: "#43A047",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
      shadowColor: "#43A047",
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 5,
    },

    buttonDisabled: {
      opacity: 0.65,
    },

    buttonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 18,
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.45)",
      justifyContent: "center",
      alignItems: "center",
      padding: 25,
    },

    successModal: {
      width: "100%",
      maxWidth: 440,
      backgroundColor: "#FFFFFF",
      borderRadius: 22,
      padding: 25,
      alignItems: "center",
      shadowColor: "#000000",
      shadowOpacity: 0.2,
      shadowRadius: 15,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      elevation: 8,
    },

    successIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: "#43A047",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 15,
    },

    successIconText: {
      color: "#FFFFFF",
      fontSize: 36,
      fontWeight: "700",
    },

    successTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: "#166534",
      textAlign: "center",
      marginBottom: 8,
    },

    successText: {
      fontSize: 15,
      color: "#64748B",
      textAlign: "center",
      marginBottom: 12,
    },

    successBook: {
      fontSize: 17,
      fontWeight: "700",
      color: "#111827",
      textAlign: "center",
      marginBottom: 6,
    },

    successDueDate: {
      fontSize: 14,
      color: "#64748B",
      marginBottom: 20,
    },

    successButton: {
      width: "100%",
      height: 50,
      borderRadius: 12,
      backgroundColor: "#43A047",
      justifyContent: "center",
      alignItems: "center",
    },

    successButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
  });
