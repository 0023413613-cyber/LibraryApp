import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { getBorrowHistory } from "../database/borrowRepository";

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);

  async function loadData() {
    try {
      const data = await getBorrowHistory();
      setHistory(data as any[]);
    } catch (error) {
      console.log(error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Chưa có lịch sử mượn sách
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>
              {item.title}
            </Text>

            <Text>Người mượn: {item.borrower}</Text>

            <Text>Ngày mượn: {item.borrowDate}</Text>

            <Text>Hạn trả: {item.dueDate}</Text>

            <Text>
              Ngày trả: {item.returnDate ?? "Chưa trả"}
            </Text>

            <Text>
              Trạng thái: {item.returnDate ? "Đã trả" : "Đang mượn"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
  },

  card: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  empty: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 16,
  },
});