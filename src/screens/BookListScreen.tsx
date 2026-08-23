import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import BookCard from "../components/BookCard";

import { Book } from "../models/Book";

import {
  getAllBooks,
  deleteBooks,
} from "../database/bookRepository";

export default function BookListScreen({
  navigation,
}: any) {
  const [books, setBooks] = useState<Book[]>([]);

  const [search, setSearch] = useState("");

  const [selectionMode, setSelectionMode] = useState(false);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const loadBooks = useCallback(
    async () => {
      try {
        const data = await getAllBooks();

        setBooks(data);
      } catch (error) {
        console.log(
          "Load books error:",
          error
        );
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

  // =========================
  // Lọc sách
  // =========================

  const filteredBooks = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return books;
    }

    return books.filter(
      (book) =>
        book.title
          .toLowerCase()
          .includes(keyword) ||

        book.author
          .toLowerCase()
          .includes(keyword) ||

        book.category
          .toLowerCase()
          .includes(keyword)
    );
  }, [books, search]);

  // =========================
  // Mở chi tiết
  // =========================

  const handleBookPress = (
    book: Book
  ) => {
    navigation.navigate(
      "BookDetail",
      {
        bookId: book.id,
      }
    );
  };

  // =========================
  // Bắt đầu chọn nhiều
  // =========================

  const handleLongPress = (
    book: Book
  ) => {
    setSelectionMode(true);

    setSelectedIds([book.id]);
  };

  // =========================
  // Chọn / bỏ chọn
  // =========================

  const handleSelect = (
    book: Book
  ) => {
    setSelectedIds((current) => {
      if (current.includes(book.id)) {
        return current.filter(
          (id) => id !== book.id
        );
      }

      return [
        ...current,
        book.id,
      ];
    });
  };

  // =========================
  // Thoát chế độ chọn
  // =========================

  const exitSelectionMode = () => {
    setSelectionMode(false);

    setSelectedIds([]);
  };

  // =========================
  // Chọn tất cả
  // =========================

  const selectAll = () => {
    const ids = filteredBooks.map(
      (book) => book.id
    );

    setSelectedIds(ids);
  };

  // =========================
// Xóa nhiều
// =========================

// Hàm thực hiện xóa thật sự
const performDelete = async () => {
  try {
    console.log("Bắt đầu xóa:", selectedIds);

    const result = await deleteBooks(selectedIds);

    console.log("Kết quả xóa:", result);

    await loadBooks();

    exitSelectionMode();

    // Có sách đang được mượn
    if (result.skipped.length > 0) {
      const message =
        `Đã xóa ${result.deleted} sách.\n\n` +
        `Không xóa được ${result.skipped.length} sách đang được mượn:\n` +
        result.skipped.join(", ");

      if (Platform.OS === "web") {
        window.alert(message);
      } else {
        Alert.alert("Đã xử lý", message);
      }

      return;
    }

    // Xóa thành công
    const successMessage =
      `Đã xóa ${result.deleted} sách.`;

    if (Platform.OS === "web") {
      window.alert(successMessage);
    } else {
      Alert.alert("Thành công", successMessage);
    }

  } catch (error: any) {
    console.log("Delete books error:", error);

    const errorMessage =
      error?.message ?? "Không thể xóa sách.";

    if (Platform.OS === "web") {
      window.alert(errorMessage);
    } else {
      Alert.alert("Lỗi", errorMessage);
    }
  }
};


// Hàm mở hộp xác nhận
const handleDeleteSelected = async () => {
  if (selectedIds.length === 0) {
    Alert.alert(
      "Thông báo",
      "Vui lòng chọn ít nhất một cuốn sách."
    );
    return;
  }

  const message =
    `Bạn có chắc muốn xóa ${selectedIds.length} cuốn sách đã chọn?`;

  // Web
  if (Platform.OS === "web") {
    const confirmed =
      window.confirm(message);

    if (!confirmed) {
      return;
    }

    await performDelete();
    return;
  }

  // Android / iOS
  setShowDeleteModal(true);
};

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            THƯ VIỆN CÁ NHÂN
          </Text>

          <Text style={styles.title}>
            Tủ sách
          </Text>

          <Text style={styles.subtitle}>
            {books.length} cuốn sách trong tủ
          </Text>
        </View>

        <View style={styles.countBox}>
          <Text style={styles.countNumber}>
            {books.length}
          </Text>

          <Text style={styles.countLabel}>
            SÁCH
          </Text>
        </View>
      </View>

      {/* ================= CHẾ ĐỘ CHỌN ================= */}

      {selectionMode ? (
        <View style={styles.selectionHeader}>
          <TouchableOpacity
            onPress={exitSelectionMode}
          >
            <Text style={styles.cancelText}>
              Hủy
            </Text>
          </TouchableOpacity>

          <Text style={styles.selectionTitle}>
            Đã chọn {selectedIds.length}
          </Text>

          <TouchableOpacity
            onPress={selectAll}
          >
            <Text style={styles.selectAllText}>
              Chọn tất cả
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>
              ⌕
            </Text>

            <TextInput
              style={styles.search}
              placeholder="Tìm tên, tác giả hoặc thể loại"
              placeholderTextColor="#9AA3B2"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
      )}

      {/* ================= NÚT THÊM ================= */}

      {!selectionMode && (
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate(
              "AddBook"
            )
          }
        >
          <View style={styles.addIcon}>
            <Text style={styles.addIconText}>
              +
            </Text>
          </View>

          <Text style={styles.addButtonText}>
            Thêm sách mới
          </Text>
        </TouchableOpacity>
      )}

      {/* ================= TIÊU ĐỀ DANH SÁCH ================= */}

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {selectionMode
            ? "Chọn sách cần xóa"
            : "Danh sách sách"}
        </Text>

        <Text style={styles.resultCount}>
          {filteredBooks.length} kết quả
        </Text>
      </View>

      {/* ================= DANH SÁCH ================= */}

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) =>
          item.id.toString()
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.listContent
        }
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={handleBookPress}
            onLongPress={
              handleLongPress
            }
            selectionMode={
              selectionMode
            }
            selected={selectedIds.includes(
              item.id
            )}
            onSelect={handleSelect}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>
              📚
            </Text>

            <Text style={styles.emptyTitle}>
              Chưa có sách
            </Text>

            <Text style={styles.emptyText}>
              Hãy thêm cuốn sách đầu tiên
              vào tủ của bạn.
            </Text>
          </View>
        }
      />

      {/* ================= NÚT XÓA ================= */}

      {selectionMode && (
        <View style={styles.deleteBar}>
          <Text style={styles.deleteInfo}>
            {selectedIds.length} sách
          </Text>

          <TouchableOpacity
            style={[
              styles.deleteButton,
              selectedIds.length === 0 &&
                styles.deleteButtonDisabled,
            ]}
            disabled={selectedIds.length === 0}
            onPress={handleDeleteSelected}
          >
            <Text style={styles.deleteIcon}>
              🗑
            </Text>

            <Text style={styles.deleteButtonText}>
              Xóa đã chọn
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowDeleteModal(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            
            <View style={styles.deleteIconCircle}>
              <Text style={styles.deleteIconLarge}>
                🗑
              </Text>
            </View>

            <Text style={styles.modalTitle}>
              Xóa sách?
            </Text>

            <Text style={styles.modalMessage}>
              Bạn có chắc muốn xóa{" "}
              <Text style={styles.boldText}>
                {selectedIds.length} cuốn sách
              </Text>{" "}
              đã chọn?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                activeOpacity={0.8}
                onPress={() =>
                  setShowDeleteModal(false)
                }
              >
                <Text style={styles.cancelModalText}>
                  Hủy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteButton}
                activeOpacity={0.8}
                onPress={async () => {
                  setShowDeleteModal(false);
                  await performDelete();
                }}
              >
                <Text style={styles.confirmDeleteText}>
                  Xóa sách
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: "#F7F8FC",

    paddingHorizontal: 16,
  },

  // ================= HEADER =================

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingTop: 22,

    paddingBottom: 18,
  },

  eyebrow: {
    fontSize: 11,

    fontWeight: "700",

    letterSpacing: 1.4,

    color: "#635BFF",

    marginBottom: 5,
  },

  title: {
    fontSize: 30,

    fontWeight: "800",

    color: "#182033",
  },

  subtitle: {
    marginTop: 5,

    fontSize: 14,

    color: "#8992A4",
  },

  countBox: {
    width: 64,
    height: 64,

    borderRadius: 20,

    backgroundColor: "#EEF0FF",

    justifyContent: "center",
    alignItems: "center",
  },

  countNumber: {
    fontSize: 21,

    fontWeight: "800",

    color: "#4F46E5",
  },

  countLabel: {
    fontSize: 9,

    fontWeight: "700",

    color: "#635BFF",

    marginTop: 1,
  },

  // ================= SEARCH =================

  searchRow: {
    marginBottom: 12,
  },

  searchContainer: {
    height: 54,

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderRadius: 16,

    borderWidth: 1,

    borderColor: "#E4E7EE",

    paddingHorizontal: 14,
  },

  searchIcon: {
    fontSize: 25,

    color: "#7B8495",

    marginRight: 7,
  },

  search: {
    flex: 1,

    height: 54,

    fontSize: 14,

    color: "#1F2937",
  },

  // ================= ADD =================

  addButton: {
    height: 54,

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#5146E5",

    borderRadius: 16,

    marginBottom: 20,

    shadowColor: "#5146E5",

    shadowOpacity: 0.22,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 4,
  },

  addIcon: {
    width: 26,
    height: 26,

    borderRadius: 8,

    backgroundColor:
      "rgba(255,255,255,0.2)",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 9,
  },

  addIconText: {
    color: "#FFFFFF",

    fontSize: 21,

    lineHeight: 23,
  },

  addButtonText: {
    color: "#FFFFFF",

    fontSize: 15,

    fontWeight: "700",
  },

  // ================= LIST HEADER =================

  listHeader: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 12,
  },

  listTitle: {
    fontSize: 18,

    fontWeight: "800",

    color: "#20283A",
  },

  resultCount: {
    fontSize: 12,

    color: "#8992A4",
  },

  listContent: {
    paddingBottom: 100,
  },

  // ================= SELECTION =================

  selectionHeader: {
    height: 54,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    backgroundColor: "#FFFFFF",

    borderRadius: 16,

    paddingHorizontal: 15,

    marginBottom: 16,

    borderWidth: 1,

    borderColor: "#E4E7EE",
  },

  cancelText: {
    color: "#64748B",

    fontSize: 14,

    fontWeight: "600",
  },

  selectionTitle: {
    color: "#182033",

    fontSize: 15,

    fontWeight: "800",
  },

  selectAllText: {
    color: "#5146E5",

    fontSize: 14,

    fontWeight: "700",
  },

  // ================= DELETE BAR =================

  deleteBar: {
    position: "absolute",

    left: 16,
    right: 16,
    bottom: 15,

    height: 64,

    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingHorizontal: 12,

    shadowColor: "#000",

    shadowOpacity: 0.12,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 7,

    borderWidth: 1,

    borderColor: "#E6E8EF",
  },

  deleteInfo: {
    marginLeft: 8,

    color: "#596273",

    fontSize: 14,

    fontWeight: "600",
  },

  deleteButton: {
    height: 44,

    paddingHorizontal: 18,

    borderRadius: 12,

    backgroundColor: "#E53935",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",
  },

  deleteButtonDisabled: {
    backgroundColor: "#CBD0D8",
  },

  deleteIcon: {
    fontSize: 15,

    marginRight: 7,
  },

  deleteButtonText: {
    color: "#FFFFFF",

    fontSize: 14,

    fontWeight: "700",
  },

  // ================= EMPTY =================

  empty: {
    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    paddingVertical: 50,

    paddingHorizontal: 25,

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#E8EAF0",
  },

  emptyIcon: {
    fontSize: 38,

    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 17,

    fontWeight: "700",

    color: "#293246",
  },

  emptyText: {
    marginTop: 6,

    textAlign: "center",

    color: "#8B94A5",

    fontSize: 13,

    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  deleteModal: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },

  deleteIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  deleteIconLarge: {
    fontSize: 28,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#182033",
    marginBottom: 10,
  },

  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: "#667085",
    textAlign: "center",
    marginBottom: 24,
  },

  boldText: {
    fontWeight: "700",
    color: "#182033",
  },

  modalButtons: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },

  cancelModalButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F2F4F7",
    justifyContent: "center",
    alignItems: "center",
  },

  cancelModalText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475467",
  },

  confirmDeleteButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },

  confirmDeleteText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});