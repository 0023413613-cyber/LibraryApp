import React, {
  useCallback,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
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
  image: string;
}

export default function BorrowListScreen() {
  const [borrowList, setBorrowList] =
    useState<BorrowRecord[]>([]);

  // =========================
  // LOAD SÁCH ĐANG MƯỢN
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
              item.returnDate === null ||
              item.returnDate === undefined ||
              item.returnDate === ""
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
  // HIỂN THỊ TỪNG SÁCH
  // =========================

  const renderItem = ({
    item,
  }: {
    item: BorrowRecord;
  }) => {
    return (
      <View style={styles.card}>

        {/* ẢNH SÁCH */}

        {item.image ? (
          <Image
            source={{
              uri: item.image,
            }}
            style={styles.image}
          />
        ) : (
          <View style={styles.noImage}>
            <Ionicons
              name="library-outline"
              size={38}
              color="#5146E5"
            />
          </View>
        )}

        {/* THÔNG TIN */}

        <View style={styles.info}>

          <Text
            style={styles.title}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {/* NGƯỜI MƯỢN */}

          <View style={styles.infoRow}>
            <Ionicons
              name="person-outline"
              size={16}
              color="#64748B"
            />

            <Text style={styles.text}>
              Người mượn: {item.borrower}
            </Text>
          </View>

          {/* ĐIỆN THOẠI */}

          <View style={styles.infoRow}>
            <Ionicons
              name="call-outline"
              size={16}
              color="#64748B"
            />

            <Text style={styles.text}>
              Điện thoại:{" "}
              {item.phone || "Không có"}
            </Text>
          </View>

          {/* NGÀY MƯỢN */}

          <View style={styles.infoRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#64748B"
            />

            <Text style={styles.text}>
              Ngày mượn: {item.borrowDate}
            </Text>
          </View>

          {/* HẠN TRẢ */}

          <View style={styles.infoRow}>
            <Ionicons
              name="time-outline"
              size={16}
              color="#E65100"
            />

            <Text style={styles.dueDate}>
              Hạn trả: {item.dueDate}
            </Text>
          </View>

          {/* TRẠNG THÁI */}

          <View style={styles.badge}>

            <Ionicons
              name="book-outline"
              size={14}
              color="#EA580C"
            />

            <Text style={styles.badgeText}>
              Đang mượn
            </Text>

          </View>

        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>

      {/* ================= HEADER ================= */}

      <View style={styles.headerRow}>

        <View style={styles.headerIcon}>
          <Ionicons
            name="library-outline"
            size={34}
            color="#5146E5"
          />
        </View>

        <Text style={styles.header}>
          Sách đang mượn
        </Text>

      </View>

      <Text style={styles.subTitle}>
        Hiện có {borrowList.length} sách đang được mượn
      </Text>

      {/* ================= DANH SÁCH ================= */}

      <FlatList
        data={borrowList}

        keyExtractor={(item) =>
          item.id.toString()
        }

        renderItem={renderItem}

        showsVerticalScrollIndicator={false}

        contentContainerStyle={
          borrowList.length === 0
            ? styles.emptyContainer
            : styles.list
        }

        ListEmptyComponent={
          <View style={styles.empty}>

            {/* ICON */}

            <View style={styles.emptyIconBox}>
              <Ionicons
                name="book-outline"
                size={42}
                color="#5146E5"
              />
            </View>

            {/* TIÊU ĐỀ */}

            <Text style={styles.emptyTitle}>
              Không có sách đang mượn
            </Text>

            {/* MÔ TẢ */}

            <Text style={styles.emptyText}>
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

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 16,
  },

  // ================= HEADER =================

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 2,
  },

  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  header: {
    flex: 1,
    fontSize: 27,
    fontWeight: "700",
    color: "#222",
  },

  subTitle: {
    color: "#666",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 18,
  },

  // ================= LIST =================

  list: {
    paddingBottom: 20,
  },

  // ================= CARD =================

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 12,
    marginBottom: 14,
    flexDirection: "row",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  image: {
    width: 80,
    height: 110,
    borderRadius: 10,
    backgroundColor: "#eee",
  },

  noImage: {
    width: 80,
    height: 110,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",

    justifyContent: "center",
    alignItems: "center",
  },

  info: {
    flex: 1,
    marginLeft: 14,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },

  // ================= INFO =================

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  text: {
    flex: 1,
    marginLeft: 7,
    fontSize: 12,
    color: "#64748B",
  },

  dueDate: {
    flex: 1,
    marginLeft: 7,
    fontSize: 12,
    color: "#E65100",
    fontWeight: "600",
  },

  // ================= BADGE =================

  badge: {
    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFF7ED",

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 10,

    marginTop: 4,
  },

  badgeText: {
    marginLeft: 5,
    color: "#EA580C",
    fontSize: 11,
    fontWeight: "700",
  },

  // ================= EMPTY =================

  emptyContainer: {
    flexGrow: 1,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: 25,
    paddingBottom: 80,
  },

  emptyIconBox: {
    width: 90,
    height: 90,
    borderRadius: 28,

    backgroundColor: "#EEF2FF",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222",

    textAlign: "center",

    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#8A94A6",

    textAlign: "center",

    lineHeight: 21,
  },
});