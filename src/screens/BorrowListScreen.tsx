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

  const loadBorrowList = useCallback(async () => {
    try {
      const data =
        await getBorrowHistory();

      const records =
        data as BorrowRecord[];

      const activeBooks = records.filter(
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

  const renderItem = ({
    item,
  }: {
    item: BorrowRecord;
  }) => {
    return (
      <View style={styles.card}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
          />
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageText}>
              📚
            </Text>
          </View>
        )}

        <View style={styles.info}>
          <Text
            style={styles.title}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <Text style={styles.text}>
            👤 Người mượn: {item.borrower}
          </Text>

          <Text style={styles.text}>
            📞 Điện thoại:{" "}
            {item.phone || "Không có"}
          </Text>

          <Text style={styles.text}>
            📅 Ngày mượn: {item.borrowDate}
          </Text>

          <Text style={styles.dueDate}>
            ⏰ Hạn trả: {item.dueDate}
          </Text>

          <View style={styles.badge}>
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
      <Text style={styles.header}>
        📚 Sách đang mượn
      </Text>

      <Text style={styles.subTitle}>
        Hiện có {borrowList.length} sách đang được mượn
      </Text>

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
            <Text style={styles.emptyIcon}>
              📖
            </Text>

            <Text style={styles.emptyTitle}>
              Không có sách đang mượn
            </Text>

            <Text style={styles.emptyText}>
              Hiện tại không có sách nào đang được mượn.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 16,
  },

  header: {
    fontSize: 27,
    fontWeight: "700",
    color: "#222",
    marginTop: 10,
  },

  subTitle: {
    color: "#666",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 18,
  },

  list: {
    paddingBottom: 20,
  },

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
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },

  noImageText: {
    fontSize: 32,
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

  text: {
    fontSize: 13,
    color: "#666",
    marginBottom: 5,
  },

  dueDate: {
    fontSize: 13,
    color: "#E65100",
    fontWeight: "700",
    marginBottom: 6,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    color: "#E65100",
    fontSize: 12,
    fontWeight: "700",
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  empty: {
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },

  emptyText: {
    color: "#888",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
});