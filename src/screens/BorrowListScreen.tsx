import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  RefreshControl,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useFocusEffect } from "@react-navigation/native";

import { getBorrowHistory } from "../database/borrowRepository";

interface BorrowRecord {
  id: number;
  bookId: number;
  borrower: string;
  phone: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  title: string;
  author?: string;
  image?: string;
}

export default function BorrowListScreen() {
  const [borrowList, setBorrowList] =
    useState<BorrowRecord[]>([]);

  const [refreshing, setRefreshing] =
    useState(false);

  // =========================
  // LOAD DỮ LIỆU
  // =========================

  const loadBorrowList =
    useCallback(async () => {
      try {
        const data =
          await getBorrowHistory();

        const records =
          data as BorrowRecord[];

        const activeBooks =
          records.filter(
            (item) =>
              !item.returnDate
          );

        setBorrowList(activeBooks);
      } catch (error) {
        console.log(
          "Lỗi tải sách đang mượn:",
          error
        );
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadBorrowList();
    }, [loadBorrowList])
  );

  // =========================
  // REFRESH
  // =========================

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadBorrowList();

    setRefreshing(false);
  };

  // =========================
  // FORMAT NGÀY
  // =========================

  const formatDate = (
    date?: string
  ) => {
    if (!date) {
      return "--/--/----";
    }

    const parts =
      date.split("-");

    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return date;
  };

  // =========================
  // KIỂM TRA QUÁ HẠN
  // =========================

  const isOverdue = (
    dueDate: string
  ) => {
    if (!dueDate) {
      return false;
    }

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    return dueDate < today;
  };

  // =========================
  // THỐNG KÊ
  // =========================

  const statistics = useMemo(() => {
    const total =
      borrowList.length;

    const overdue =
      borrowList.filter(
        (item) =>
          isOverdue(item.dueDate)
      ).length;

    const onTime =
      total - overdue;

    return {
      total,
      overdue,
      onTime,
    };
  }, [borrowList]);

  // =========================
  // CARD SÁCH
  // =========================

  const renderItem = ({
    item,
  }: {
    item: BorrowRecord;
  }) => {
    const overdue =
      isOverdue(item.dueDate);

    return (
      <View style={styles.card}>

        {/* ================= ẢNH ================= */}

        {item.image ? (
          <Image
            source={{
              uri: item.image,
            }}
            style={styles.bookImage}
          />
        ) : (
          <View
            style={
              styles.bookImagePlaceholder
            }
          >
            <Ionicons
              name="book-outline"
              size={38}
              color="#5146E5"
            />
          </View>
        )}

        {/* ================= THÔNG TIN ================= */}

        <View
          style={styles.cardContent}
        >

          <View
            style={styles.titleRow}
          >
            <Text
              style={styles.bookTitle}
              numberOfLines={2}
            >
              {item.title}
            </Text>
          </View>

          {/* TÁC GIẢ */}

          {item.author && (
            <Text
              style={styles.author}
              numberOfLines={1}
            >
              {item.author}
            </Text>
          )}

          {/* NGƯỜI MƯỢN */}

          <View
            style={styles.infoRow}
          >
            <Ionicons
              name="person-outline"
              size={16}
              color="#64748B"
            />

            <Text
              style={styles.infoText}
            >
              {item.borrower}
            </Text>
          </View>

          {/* SỐ ĐIỆN THOẠI */}

          {item.phone && (
            <View
              style={styles.infoRow}
            >
              <Ionicons
                name="call-outline"
                size={16}
                color="#64748B"
              />

              <Text
                style={styles.infoText}
              >
                {item.phone}
              </Text>
            </View>
          )}

          {/* NGÀY MƯỢN */}

          <View
            style={styles.infoRow}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#64748B"
            />

            <Text
              style={styles.infoText}
            >
              Mượn:{" "}
              {formatDate(
                item.borrowDate
              )}
            </Text>
          </View>

          {/* HẠN TRẢ */}

          <View
            style={styles.infoRow}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={
                overdue
                  ? "#DC2626"
                  : "#64748B"
              }
            />

            <Text
              style={[
                styles.infoText,

                overdue &&
                  styles.overdueDate,
              ]}
            >
              Hạn trả:{" "}
              {formatDate(
                item.dueDate
              )}
            </Text>
          </View>

          {/* TRẠNG THÁI */}

          <View
            style={[
              styles.statusBadge,

              overdue
                ? styles.overdueBadge
                : styles.onTimeBadge,
            ]}
          >
            <Ionicons
              name={
                overdue
                  ? "alert-circle-outline"
                  : "checkmark-circle-outline"
              }
              size={15}
              color={
                overdue
                  ? "#DC2626"
                  : "#059669"
              }
            />

            <Text
              style={[
                styles.statusText,

                overdue
                  ? styles.overdueText
                  : styles.onTimeText,
              ]}
            >
              {overdue
                ? "Quá hạn"
                : "Đang mượn"}
            </Text>
          </View>

        </View>
      </View>
    );
  };

  return (
    <View
      style={styles.container}
    >

      {/* ================= HEADER ================= */}

      <View
        style={styles.header}
      >

        <View
          style={styles.headerText}
        >
          <Text
            style={styles.eyebrow}
          >
            THƯ VIỆN CÁ NHÂN
          </Text>

          <Text
            style={styles.headerTitle}
          >
            Sách đang mượn
          </Text>

          <Text
            style={styles.subtitle}
          >
            Theo dõi những sách bạn đang mượn
          </Text>
        </View>

        <View
          style={styles.headerIcon}
        >
          <Ionicons
            name="library-outline"
            size={31}
            color="#5146E5"
          />
        </View>

      </View>

      {/* ================= THỐNG KÊ ================= */}

      <View
        style={styles.statistics}
      >

        {/* TỔNG */}

        <View
          style={styles.statCard}
        >
          <View
            style={[
              styles.statIcon,
              styles.totalIcon,
            ]}
          >
            <Ionicons
              name="book-outline"
              size={20}
              color="#5146E5"
            />
          </View>

          <Text
            style={styles.statNumber}
          >
            {statistics.total}
          </Text>

          <Text
            style={styles.statLabel}
          >
            Đang mượn
          </Text>
        </View>

        {/* TRONG HẠN */}

        <View
          style={styles.statCard}
        >
          <View
            style={[
              styles.statIcon,
              styles.onTimeIcon,
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="#059669"
            />
          </View>

          <Text
            style={styles.statNumber}
          >
            {statistics.onTime}
          </Text>

          <Text
            style={styles.statLabel}
          >
            Trong hạn
          </Text>
        </View>

        {/* QUÁ HẠN */}

        <View
          style={styles.statCard}
        >
          <View
            style={[
              styles.statIcon,
              styles.overdueIcon,
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color="#DC2626"
            />
          </View>

          <Text
            style={styles.statNumber}
          >
            {statistics.overdue}
          </Text>

          <Text
            style={styles.statLabel}
          >
            Quá hạn
          </Text>
        </View>

      </View>

      {/* ================= TIÊU ĐỀ ================= */}

      <View
        style={styles.sectionHeader}
      >
        <View>
          <Text
            style={styles.sectionTitle}
          >
            Danh sách sách
          </Text>

          <Text
            style={styles.sectionSubtitle}
          >
            {borrowList.length} sách đang được mượn
          </Text>
        </View>

        <TouchableOpacity
          onPress={
            handleRefresh
          }
          style={styles.refreshButton}
        >
          <Ionicons
            name="refresh-outline"
            size={20}
            color="#5146E5"
          />
        </TouchableOpacity>
      </View>

      {/* ================= DANH SÁCH ================= */}

      <FlatList
        data={borrowList}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
          />
        }
        contentContainerStyle={
          borrowList.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        ListEmptyComponent={
          <View
            style={styles.empty}
          >

            <View
              style={
                styles.emptyIconBox
              }
            >
              <Ionicons
                name="book-outline"
                size={43}
                color="#5146E5"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Không có sách đang mượn
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Hiện tại không có sách nào đang được mượn.
            </Text>

          </View>
        }
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
      backgroundColor: "#F8F9FD",
      paddingHorizontal: 16,
    },

    // ================= HEADER =================

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 20,
      paddingBottom: 18,
    },

    headerText: {
      flex: 1,
    },

    eyebrow: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.4,
      color: "#5146E5",
      marginBottom: 5,
    },

    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: "#172033",
    },

    subtitle: {
      fontSize: 13,
      color: "#8992A4",
      marginTop: 5,
    },

    headerIcon: {
      width: 62,
      height: 62,
      borderRadius: 20,
      backgroundColor: "#EEF2FF",
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 10,
    },

    // ================= STATISTICS =================

    statistics: {
      flexDirection: "row",
      gap: 9,
      marginBottom: 20,
    },

    statCard: {
      flex: 1,
      backgroundColor: "#FFFFFF",
      borderRadius: 17,
      paddingVertical: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#EEF0F4",
    },

    statIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 5,
    },

    totalIcon: {
      backgroundColor: "#EEF2FF",
    },

    onTimeIcon: {
      backgroundColor: "#ECFDF5",
    },

    overdueIcon: {
      backgroundColor: "#FEF2F2",
    },

    statNumber: {
      fontSize: 20,
      fontWeight: "800",
      color: "#172033",
    },

    statLabel: {
      fontSize: 10,
      color: "#7B8495",
      marginTop: 2,
      fontWeight: "600",
    },

    // ================= SECTION =================

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#20283A",
    },

    sectionSubtitle: {
      fontSize: 11,
      color: "#8992A4",
      marginTop: 3,
    },

    refreshButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "#EEF2FF",
      justifyContent: "center",
      alignItems: "center",
    },

    // ================= LIST =================

    list: {
      paddingBottom: 25,
    },

    // ================= CARD =================

    card: {
      flexDirection: "row",
      backgroundColor: "#FFFFFF",
      borderRadius: 19,
      padding: 12,
      marginBottom: 13,
      borderWidth: 1,
      borderColor: "#EEF0F4",
      elevation: 2,
    },

    bookImage: {
      width: 82,
      height: 112,
      borderRadius: 14,
      backgroundColor: "#F1F5F9",
    },

    bookImagePlaceholder: {
      width: 82,
      height: 112,
      borderRadius: 14,
      backgroundColor: "#EEF2FF",
      justifyContent: "center",
      alignItems: "center",
    },

    cardContent: {
      flex: 1,
      marginLeft: 13,
    },

    titleRow: {
      marginBottom: 3,
    },

    bookTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: "#172033",
      lineHeight: 21,
    },

    author: {
      fontSize: 12,
      color: "#8992A4",
      marginBottom: 7,
    },

    // ================= INFO =================

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },

    infoText: {
      flex: 1,
      marginLeft: 7,
      fontSize: 12,
      color: "#64748B",
    },

    overdueDate: {
      color: "#DC2626",
      fontWeight: "700",
    },

    // ================= STATUS =================

    statusBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 10,
      marginTop: 2,
    },

    onTimeBadge: {
      backgroundColor: "#ECFDF5",
    },

    overdueBadge: {
      backgroundColor: "#FEF2F2",
    },

    statusText: {
      marginLeft: 5,
      fontSize: 10,
      fontWeight: "800",
    },

    onTimeText: {
      color: "#059669",
    },

    overdueText: {
      color: "#DC2626",
    },

    // ================= EMPTY =================

    emptyContainer: {
      flexGrow: 1,
    },

    empty: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 30,
      paddingBottom: 70,
    },

    emptyIconBox: {
      width: 88,
      height: 88,
      borderRadius: 28,
      backgroundColor: "#EEF2FF",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 18,
    },

    emptyTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: "#20283A",
      textAlign: "center",
      marginBottom: 7,
    },

    emptyText: {
      fontSize: 13,
      color: "#8992A4",
      textAlign: "center",
      lineHeight: 20,
    },
  });