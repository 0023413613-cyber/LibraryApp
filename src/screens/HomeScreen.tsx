import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        📚 Quản lý thư viện
      </Text>

      <Text style={styles.welcome}>
        Xin chào 👋
      </Text>

      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.number}>0</Text>
          <Text style={styles.label}>Tổng số sách</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.number}>0</Text>
          <Text style={styles.label}>Đang mượn</Text>
        </View>
      </View>

      <View style={styles.cardLarge}>
        <Text style={styles.number}>0</Text>
        <Text style={styles.label}>Sách quá hạn</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("Books", {
          screen: "AddBook",
        })}
      >
        <Text style={styles.addText}>
          ➕ Thêm sách mới
        </Text>
      </TouchableOpacity>

      <Text style={styles.section}>
        Sách mới thêm
      </Text>

      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>
          Chưa có dữ liệu
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
  },

  welcome: {
    fontSize: 18,
    color: "#666",
    marginTop: 8,
    marginBottom: 25,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 20,
    elevation: 3,
  },

  cardLarge: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 20,
    marginTop: 18,
    elevation: 3,
  },

  number: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#2196F3",
  },

  label: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },

  addButton: {
    backgroundColor: "#2196F3",
    marginTop: 28,
    padding: 16,
    borderRadius: 15,
  },

  addText: {
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
  },

  section: {
    marginTop: 30,
    fontWeight: "bold",
    fontSize: 18,
  },

  emptyCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 30,
    marginTop: 15,
    alignItems: "center",
    elevation: 2,
  },

  emptyText: {
    color: "#999",
    fontSize: 16,
  },
});