import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import {
  getBorrowingBooks,
} from "../database/borrowRepository";

interface BorrowingBook {
  id: number;
  bookId: number;
  borrower: string;
  phone: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  title: string;
  image?: string;
}

// =====================================================
// NGÀY HIỆN TẠI - DÙNG LOCAL DATE, KHÔNG DÙNG UTC
// =====================================================

const getToday = (): string => {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
};

// =====================================================
// CHUẨN HÓA NGÀY
// Hỗ trợ YYYY-MM-DD và DD-MM-YYYY
// =====================================================

const normalizeDate = (
  value: string
): string | null => {
  const input = value?.trim();

  if (!input) {
    return null;
  }

  let year: number;
  let month: number;
  let day: number;

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    [year, month, day] =
      input.split("-").map(Number);
  } else if (
    /^\d{2}-\d{2}-\d{4}$/.test(input)
  ) {
    [day, month, year] =
      input.split("-").map(Number);
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
// TÍNH SỐ NGÀY QUÁ HẠN
// =====================================================

const getOverdueDays = (
  dueDate: string
): number => {
  const normalized =
    normalizeDate(dueDate);

  if (!normalized) {
    return 0;
  }

  const [year, month, day] =
    normalized.split("-").map(Number);

  const due = new Date(
    year,
    month - 1,
    day
  );

  const todayText = getToday();
  const [
    todayYear,
    todayMonth,
    todayDay,
  ] = todayText.split("-").map(Number);

  const today = new Date(
    todayYear,
    todayMonth - 1,
    todayDay
  );

  const difference =
    today.getTime() -
    due.getTime();

  return Math.max(
    0,
    Math.floor(
      difference /
        (1000 * 60 * 60 * 24)
    )
  );
};

// =====================================================
// OVERDUE SCREEN
// =====================================================

export default function OverdueScreen({
  navigation,
}: any) {
  const [overdueBooks, setOverdueBooks] =
    useState<BorrowingBook[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const [notifiedIds, setNotifiedIds] =
    useState<number[]>([]);

  // ===================================================
  // LOAD + LỌC SÁCH QUÁ HẠN
  // Chỉ lấy phiếu CHƯA TRẢ:
  // dueDate < today && returnDate === null
  // ===================================================

  const loadData =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(false);

        const data =
          await getBorrowingBooks();

        const books =
          data as BorrowingBook[];

        const today = getToday();

        const overdue =
          books.filter((item) => {
            if (item.returnDate) {
              return false;
            }

            const normalized =
              normalizeDate(
                item.dueDate
              );

            if (!normalized) {
              return false;
            }

            return normalized < today;
          });

        setOverdueBooks(overdue);
      } catch (err) {
        console.log(
          "Lỗi tải sách quá hạn:",
          err
        );

        setError(true);
        setOverdueBooks([]);
      } finally {
        setLoading(false);
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // ===================================================
  // THÔNG BÁO KHI PHÁT HIỆN SÁCH QUÁ HẠN
  // Không thông báo lặp liên tục cho cùng một phiếu
  // trong cùng lần mở màn hình.
  // ===================================================

  useEffect(() => {
    if (loading || overdueBooks.length === 0) {
      return;
    }

    const newOverdue =
      overdueBooks.filter(
        (item) =>
          !notifiedIds.includes(item.id)
      );

    if (newOverdue.length === 0) {
      return;
    }

    setNotifiedIds((current) => [
      ...current,
      ...newOverdue.map(
        (item) => item.id
      ),
    ]);

    if (newOverdue.length === 1) {
      const item = newOverdue[0];

      Alert.alert(
        "⚠️ Sách đã quá hạn",
        `Sách "${item.title}" đã quá hạn trả.\n\nHạn trả: ${item.dueDate}\nĐã quá hạn: ${getOverdueDays(
          item.dueDate
        )} ngày\n\nVui lòng trả sách.`,
        [
          {
            text: "Để sau",
            style: "cancel",
          },
          {
            text: "Trả sách",
            onPress: () => {
              navigation.navigate(
                "ReturnBookScreen"
              );
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "⚠️ Sách đã quá hạn",
        `Hiện có ${newOverdue.length} cuốn sách đã quá hạn và chưa được trả.\n\nVui lòng vào màn hình Trả sách để xử lý.`,
        [
          {
            text: "Để sau",
            style: "cancel",
          },
          {
            text: "Trả sách",
            onPress: () => {
              navigation.navigate(
                "ReturnBookScreen"
              );
            },
          },
        ]
      );
    }
  }, [
    loading,
    overdueBooks,
    notifiedIds,
    navigation,
  ]);

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <View
        style={styles.center}
      >
        <ActivityIndicator
          size="large"
          color="#DC2626"
        />

        <Text
          style={styles.loadingText}
        >
          Đang kiểm tra sách quá hạn...
        </Text>
      </View>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (error) {
    return (
      <View
        style={styles.center}
      >
        <Text
          style={styles.errorIcon}
        >
          !
        </Text>

        <Text
          style={styles.errorTitle}
        >
          Không thể tải sách quá hạn
        </Text>

        <Text
          style={styles.errorText}
        >
          Đã xảy ra lỗi khi kiểm tra dữ liệu.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.retryButton}
          onPress={loadData}
        >
          <Text
            style={styles.retryText}
          >
            Thử lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ===================================================
  // EMPTY
  // ===================================================

  if (overdueBooks.length === 0) {
    return (
      <View
        style={styles.center}
      >
        <Text
          style={styles.emptyIcon}
        >
          ✓
        </Text>

        <Text
          style={styles.emptyTitle}
        >
          Không có sách quá hạn
        </Text>

        <Text
          style={styles.emptyText}
        >
          Tất cả sách đang mượn đều trong hạn hoặc đã được trả.
        </Text>
      </View>
    );
  }

  // ===================================================
  // SUCCESS
  // ===================================================

  return (
    <View
      style={styles.container}
    >
      <View
        style={styles.header}
      >
        <Text
          style={styles.headerTitle}
        >
          Sách quá hạn
        </Text>

        <Text
          style={styles.headerCount}
        >
          {overdueBooks.length} cuốn
        </Text>
      </View>

      <View
        style={styles.warningBox}
      >
        <Text
          style={styles.warningTitle}
        >
          ⚠️ Có sách cần xử lý
        </Text>

        <Text
          style={styles.warningText}
        >
          Các phiếu dưới đây đã quá hạn và chưa được trả. Vui lòng trả sách.
        </Text>
      </View>

      <FlatList
        data={overdueBooks}
        keyExtractor={(item) =>
          item.id.toString()
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.list
        }
        onRefresh={loadData}
        refreshing={loading}
        renderItem={({ item }) => {
          const days =
            getOverdueDays(
              item.dueDate
            );

          return (
            <View
              style={styles.card}
            >
              <View
                style={
                  styles.cardHeader
                }
              >
                <Text
                  style={styles.bookTitle}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>

                <View
                  style={
                    styles.badge
                  }
                >
                  <Text
                    style={
                      styles.badgeText
                    }
                  >
                    QUÁ HẠN
                  </Text>
                </View>
              </View>

              <Text
                style={styles.info}
              >
                Người mượn:{" "}
                {item.borrower}
              </Text>

              <Text
                style={styles.info}
              >
                SĐT:{" "}
                {item.phone ||
                  "Không có"}
              </Text>

              <Text
                style={styles.info}
              >
                Ngày mượn:{" "}
                {item.borrowDate}
              </Text>

              <Text
                style={styles.dueDate}
              >
                Hạn trả:{" "}
                {item.dueDate}
              </Text>

              <Text
                style={styles.overdueDays}
              >
                Đã quá hạn {days} ngày
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.returnButton}
                onPress={() =>
                  navigation.navigate(
                    "ReturnBookScreen"
                  )
                }
              >
                <Text
                  style={
                    styles.returnButtonText
                  }
                >
                  Trả sách
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

// =====================================================
// STYLE
// =====================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8FAFC",
      paddingHorizontal: 14,
      paddingTop: 14,
    },

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F8FAFC",
      padding: 25,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 15,
      color: "#64748B",
    },

    errorIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      textAlign: "center",
      lineHeight: 50,
      fontSize: 28,
      fontWeight: "700",
      color: "#FFFFFF",
      backgroundColor: "#DC2626",
      overflow: "hidden",
      marginBottom: 15,
    },

    errorTitle: {
      fontSize: 19,
      fontWeight: "700",
      color: "#111827",
      textAlign: "center",
      marginBottom: 8,
    },

    errorText: {
      fontSize: 14,
      color: "#64748B",
      textAlign: "center",
      marginBottom: 20,
    },

    retryButton: {
      backgroundColor: "#DC2626",
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 10,
    },

    retryText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },

    emptyIcon: {
      width: 58,
      height: 58,
      borderRadius: 29,
      textAlign: "center",
      lineHeight: 58,
      fontSize: 30,
      fontWeight: "700",
      color: "#FFFFFF",
      backgroundColor: "#43A047",
      overflow: "hidden",
      marginBottom: 15,
    },

    emptyTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#111827",
      marginBottom: 8,
    },

    emptyText: {
      fontSize: 14,
      color: "#64748B",
      textAlign: "center",
      lineHeight: 21,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },

    headerTitle: {
      fontSize: 26,
      fontWeight: "700",
      color: "#111827",
    },

    headerCount: {
      fontSize: 14,
      fontWeight: "700",
      color: "#DC2626",
      backgroundColor: "#FEE2E2",
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 20,
    },

    warningBox: {
      backgroundColor: "#FFF7ED",
      borderWidth: 1,
      borderColor: "#FDBA74",
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
    },

    warningTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#C2410C",
      marginBottom: 5,
    },

    warningText: {
      fontSize: 14,
      color: "#9A3412",
      lineHeight: 20,
    },

    list: {
      paddingBottom: 30,
    },

    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#FECACA",

      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 2,
    },

    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 10,
      gap: 10,
    },

    bookTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: "700",
      color: "#111827",
    },

    badge: {
      backgroundColor: "#FEE2E2",
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 8,
    },

    badgeText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#B91C1C",
    },

    info: {
      fontSize: 14,
      color: "#64748B",
      marginBottom: 6,
    },

    dueDate: {
      fontSize: 14,
      fontWeight: "700",
      color: "#DC2626",
      marginTop: 2,
    },

    overdueDays: {
      fontSize: 14,
      fontWeight: "700",
      color: "#B91C1C",
      marginTop: 5,
      marginBottom: 4,
    },

    returnButton: {
      marginTop: 10,
      backgroundColor: "#2196F3",
      height: 48,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },

    returnButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
  });
