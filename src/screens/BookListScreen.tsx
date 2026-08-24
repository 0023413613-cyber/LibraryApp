import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import BookCard from "../components/BookCard";

import { Book } from "../models/Book";

import {
  getAllBooks,
  deleteBooks,
} from "../database/bookRepository";

export default function BookListScreen({
  navigation,
}: any) {
  // =====================================================
  // STATE
  // =====================================================

  const [books, setBooks] = useState<Book[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Nội dung tìm kiếm
  const [search, setSearch] = useState("");

  // Bộ lọc đang được chọn
  const [activeFilter, setActiveFilter] =
    useState("all");

  // Chế độ chọn nhiều sách
  const [selectionMode, setSelectionMode] =
    useState(false);

  // Danh sách ID sách được chọn
  const [selectedIds, setSelectedIds] =
    useState<number[]>([]);

  // Modal xác nhận xóa
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  // =====================================================
  // LOAD BOOKS
  // =====================================================

  const loadBooks = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getAllBooks();
        setBooks(data);
      } catch (error) {
        console.log("Load books error:", error);
        setError(
          "Không thể tải danh sách sách. Vui lòng thử lại."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

  // =====================================================
  // LẤY DANH SÁCH THỂ LOẠI
  // =====================================================

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        books
          .map((book) =>
            book.category?.trim()
          )
          .filter(Boolean) as string[]
      )
    ).sort((a, b) =>
      a.localeCompare(b, "vi")
    );
  }, [books]);

  // =====================================================
  // LỌC SÁCH
  // =====================================================

  const filteredBooks = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return books.filter((book) => {

      // -------------------------------------------------
      // LỌC THEO THANH TÌM KIẾM
      // -------------------------------------------------

      const matchesSearch =
        !keyword ||
        book.title
          .toLowerCase()
          .includes(keyword) ||
        book.author
          .toLowerCase()
          .includes(keyword) ||
        book.category
          .toLowerCase()
          .includes(keyword);

      // -------------------------------------------------
      // LỌC THEO BỘ LỌC NHANH
      // -------------------------------------------------

      let matchesFilter = true;

      // Tất cả
      if (
        activeFilter === "all"
      ) {
        matchesFilter = true;
      }

      // Có sẵn
      else if (
        activeFilter === "available"
      ) {
        matchesFilter =
          book.status ===
          "available";
      }

      // Đang mượn
      else if (
        activeFilter === "borrowed"
      ) {
        matchesFilter =
          book.status ===
          "borrowed";
      }

      // Theo thể loại
      else if (
        activeFilter.startsWith(
          "category:"
        )
      ) {
        const selectedCategory =
          activeFilter.slice(
            "category:".length
          );

        matchesFilter =
          book.category ===
          selectedCategory;
      }

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    books,
    search,
    activeFilter,
  ]);

  // =====================================================
  // ĐỔI BỘ LỌC
  // =====================================================

  const handleFilterChange = (
    filter: string
  ) => {
    setActiveFilter(filter);
  };

  // =====================================================
  // MỞ CHI TIẾT SÁCH
  // =====================================================

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

  // =====================================================
  // BẮT ĐẦU CHỌN NHIỀU
  // =====================================================

  const handleLongPress = (
    book: Book
  ) => {
    setSelectionMode(true);

    setSelectedIds([
      book.id,
    ]);
  };

  // =====================================================
  // CHỌN / BỎ CHỌN
  // =====================================================

  const handleSelect = (
    book: Book
  ) => {
    setSelectedIds(
      (current) => {

        // Nếu đã chọn -> bỏ chọn
        if (
          current.includes(
            book.id
          )
        ) {
          return current.filter(
            (id) =>
              id !== book.id
          );
        }

        // Nếu chưa chọn -> thêm vào
        return [
          ...current,
          book.id,
        ];
      }
    );
  };

  // =====================================================
  // THOÁT CHẾ ĐỘ CHỌN
  // =====================================================

  const exitSelectionMode = () => {
    setSelectionMode(false);

    setSelectedIds([]);
  };

  // =====================================================
  // CHỌN TẤT CẢ
  // =====================================================

  const selectAll = () => {
    const ids =
      filteredBooks.map(
        (book) =>
          book.id
      );

    setSelectedIds(ids);
  };

  // =====================================================
  // THỰC HIỆN XÓA
  // =====================================================

  const performDelete =
    async () => {
      try {
        console.log(
          "Bắt đầu xóa:",
          selectedIds
        );

        const result =
          await deleteBooks(
            selectedIds
          );

        console.log(
          "Kết quả xóa:",
          result
        );

        // Load lại danh sách
        await loadBooks();

        // Thoát chế độ chọn
        exitSelectionMode();

        // ------------------------------------------------
        // CÓ SÁCH KHÔNG XÓA ĐƯỢC
        // ------------------------------------------------

        if (
          result.skipped.length >
          0
        ) {
          const message =
            `Đã xóa ${result.deleted} sách.\n\n` +
            `Không xóa được ${result.skipped.length} sách đang được mượn:\n` +
            result.skipped.join(
              ", "
            );

          if (
            Platform.OS ===
            "web"
          ) {
            window.alert(
              message
            );
          } else {
            Alert.alert(
              "Đã xử lý",
              message
            );
          }

          return;
        }

        // ------------------------------------------------
        // XÓA THÀNH CÔNG
        // ------------------------------------------------

        const successMessage =
          `Đã xóa ${result.deleted} sách.`;

        if (
          Platform.OS ===
          "web"
        ) {
          window.alert(
            successMessage
          );
        } else {
          Alert.alert(
            "Thành công",
            successMessage
          );
        }

      } catch (
        error: any
      ) {
        console.log(
          "Delete books error:",
          error
        );

        const errorMessage =
          error?.message ??
          "Không thể xóa sách.";

        if (
          Platform.OS ===
          "web"
        ) {
          window.alert(
            errorMessage
          );
        } else {
          Alert.alert(
            "Lỗi",
            errorMessage
          );
        }
      }
    };

  // =====================================================
  // XÓA SÁCH ĐÃ CHỌN
  // =====================================================

  const handleDeleteSelected =
    async () => {

      if (
        selectedIds.length ===
        0
      ) {
        Alert.alert(
          "Thông báo",
          "Vui lòng chọn ít nhất một cuốn sách."
        );

        return;
      }

      const message =
        `Bạn có chắc muốn xóa ${selectedIds.length} cuốn sách đã chọn?`;

      // ------------------------------------------------
      // WEB
      // ------------------------------------------------

      if (
        Platform.OS ===
        "web"
      ) {
        const confirmed =
          window.confirm(
            message
          );

        if (!confirmed) {
          return;
        }

        await performDelete();

        return;
      }

      // ------------------------------------------------
      // ANDROID / IOS
      // ------------------------------------------------

      setShowDeleteModal(
        true
      );
    };

  // =====================================================
  // RENDER TRẠNG THÁI
  // =====================================================

  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <View style={styles.stateIconBox}>
          <ActivityIndicator size="large" color="#5146E5" />
        </View>

        <Text style={styles.stateTitle}>
          Đang tải thư viện...
        </Text>

        <Text style={styles.stateText}>
          Đang lấy danh sách sách của bạn.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateContainer}>
        <View style={styles.errorIconBox}>
          <Ionicons
            name="cloud-offline-outline"
            size={42}
            color="#EF4444"
          />
        </View>

        <Text style={styles.stateTitle}>
          Không thể tải dữ liệu
        </Text>

        <Text style={styles.stateText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          activeOpacity={0.85}
          onPress={loadBooks}
        >
          <Ionicons
            name="refresh-outline"
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.retryButtonText}>
            Thử lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <View
      style={styles.container}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <View
        style={styles.header}
      >

        <View>
          <Text
            style={styles.eyebrow}
          >
            THƯ VIỆN CÁ NHÂN
          </Text>

          <Text
            style={styles.title}
          >
            Tủ sách
          </Text>

          <Text
            style={styles.subtitle}
          >
            {books.length} cuốn sách trong tủ
          </Text>
        </View>

        <View
          style={styles.countBox}
        >
          <Text
            style={styles.countNumber}
          >
            {books.length}
          </Text>

          <Text
            style={styles.countLabel}
          >
            SÁCH
          </Text>
        </View>

      </View>

      {/* =================================================
          CHẾ ĐỘ CHỌN
      ================================================= */}

      {selectionMode ? (

        <View
          style={
            styles.selectionHeader
          }
        >

          <TouchableOpacity
            onPress={
              exitSelectionMode
            }
          >
            <Text
              style={
                styles.cancelText
              }
            >
              Hủy
            </Text>
          </TouchableOpacity>

          <Text
            style={
              styles.selectionTitle
            }
          >
            Đã chọn{" "}
            {selectedIds.length}
          </Text>

          <TouchableOpacity
            onPress={
              selectAll
            }
          >
            <Text
              style={
                styles.selectAllText
              }
            >
              Chọn tất cả
            </Text>
          </TouchableOpacity>

        </View>

      ) : (

        /* =================================================
           THANH TÌM KIẾM
        ================================================= */

        <View
          style={styles.searchRow}
        >

          <View
            style={
              styles.searchContainer
            }
          >

            <Ionicons
              name="search-outline"
              size={21}
              color="#7B8495"
              style={
                styles.searchIcon
              }
            />

            <TextInput
              style={
                styles.search
              }
              placeholder="Tìm tên, tác giả hoặc thể loại"
              placeholderTextColor="#9AA3B2"
              value={search}
              onChangeText={
                setSearch
              }
            />

            {/* Nút xóa nội dung tìm kiếm */}

            {search.length >
              0 && (

              <TouchableOpacity
                onPress={() =>
                  setSearch("")
                }
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color="#A0A7B5"
                />
              </TouchableOpacity>

            )}

          </View>

        </View>
      )}

      {/* =================================================
          BỘ LỌC
      ================================================= */}

      {!selectionMode && (

        <View
          style={
            styles.filterSection
          }
        >

          <View
            style={
              styles.filterHeader
            }
          >

            <Text
              style={
                styles.filterTitle
              }
            >
              Bộ lọc
            </Text>

            <Text
              style={
                styles.filterHint
              }
            >
              Chọn để lọc
            </Text>

          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.filterList
            }
          >

            {/* =================================================
                TẤT CẢ
            ================================================= */}

            <TouchableOpacity
              activeOpacity={
                0.8
              }
              style={[
                styles.filterChip,

                activeFilter ===
                  "all" &&
                  styles.filterChipActive,
              ]}
              onPress={() =>
                handleFilterChange(
                  "all"
                )
              }
            >

              <Ionicons
                name="library-outline"
                size={17}
                color={
                  activeFilter ===
                  "all"
                    ? "#FFFFFF"
                    : "#5146E5"
                }
              />

              <Text
                style={[
                  styles.filterChipText,

                  activeFilter ===
                    "all" &&
                    styles.filterChipTextActive,
                ]}
              >
                Tất cả
              </Text>

              <Text
                style={[
                  styles.filterCount,

                  activeFilter ===
                    "all" &&
                    styles.filterCountActive,
                ]}
              >
                {books.length}
              </Text>

            </TouchableOpacity>

            {/* =================================================
                CÓ SẴN
            ================================================= */}

            <TouchableOpacity
              activeOpacity={
                0.8
              }
              style={[
                styles.filterChip,

                activeFilter ===
                  "available" &&
                  styles.filterChipActive,
              ]}
              onPress={() =>
                handleFilterChange(
                  "available"
                )
              }
            >

              <Ionicons
                name="checkmark-circle-outline"
                size={17}
                color={
                  activeFilter ===
                  "available"
                    ? "#FFFFFF"
                    : "#16A34A"
                }
              />

              <Text
                style={[
                  styles.filterChipText,

                  activeFilter ===
                    "available" &&
                    styles.filterChipTextActive,
                ]}
              >
                Có sẵn
              </Text>

              <Text
                style={[
                  styles.filterCount,

                  activeFilter ===
                    "available" &&
                    styles.filterCountActive,
                ]}
              >
                {
                  books.filter(
                    (book) =>
                      book.status ===
                      "available"
                  ).length
                }
              </Text>

            </TouchableOpacity>

            {/* =================================================
                ĐANG MƯỢN
            ================================================= */}

            <TouchableOpacity
              activeOpacity={
                0.8
              }
              style={[
                styles.filterChip,

                activeFilter ===
                  "borrowed" &&
                  styles.filterChipActive,
              ]}
              onPress={() =>
                handleFilterChange(
                  "borrowed"
                )
              }
            >

              <Ionicons
                name="book-outline"
                size={17}
                color={
                  activeFilter ===
                  "borrowed"
                    ? "#FFFFFF"
                    : "#D97706"
                }
              />

              <Text
                style={[
                  styles.filterChipText,

                  activeFilter ===
                    "borrowed" &&
                    styles.filterChipTextActive,
                ]}
              >
                Đang mượn
              </Text>

              <Text
                style={[
                  styles.filterCount,

                  activeFilter ===
                    "borrowed" &&
                    styles.filterCountActive,
                ]}
              >
                {
                  books.filter(
                    (book) =>
                      book.status ===
                      "borrowed"
                  ).length
                }
              </Text>

            </TouchableOpacity>

            {/* =================================================
                CÁC THỂ LOẠI
            ================================================= */}

            {categories.map(
              (
                category
              ) => {

                const filterValue =
                  `category:${category}`;

                const isActive =
                  activeFilter ===
                  filterValue;

                const categoryCount =
                  books.filter(
                    (book) =>
                      book.category ===
                      category
                  ).length;

                return (

                  <TouchableOpacity
                    key={
                      category
                    }
                    activeOpacity={
                      0.8
                    }
                    style={[
                      styles.filterChip,

                      isActive &&
                        styles.filterChipActive,
                    ]}
                    onPress={() =>
                      handleFilterChange(
                        filterValue
                      )
                    }
                  >

                    <Ionicons
                      name="pricetag-outline"
                      size={17}
                      color={
                        isActive
                          ? "#FFFFFF"
                          : "#5146E5"
                      }
                    />

                    <Text
                      style={[
                        styles.filterChipText,

                        isActive &&
                          styles.filterChipTextActive,
                      ]}
                      numberOfLines={
                        1
                      }
                    >
                      {category}
                    </Text>

                    <Text
                      style={[
                        styles.filterCount,

                        isActive &&
                          styles.filterCountActive,
                      ]}
                    >
                      {
                        categoryCount
                      }
                    </Text>

                  </TouchableOpacity>

                );
              }
            )}

          </ScrollView>

        </View>
      )}

      {/* =================================================
          NÚT THÊM SÁCH
      ================================================= */}

      {!selectionMode && (

        <TouchableOpacity
          style={
            styles.addButton
          }
          activeOpacity={
            0.85
          }
          onPress={() =>
            navigation.navigate(
              "AddBook"
            )
          }
        >

          <View
            style={
              styles.addIcon
            }
          >
            <Text
              style={
                styles.addIconText
              }
            >
              +
            </Text>
          </View>

          <Text
            style={
              styles.addButtonText
            }
          >
            Thêm sách mới
          </Text>

        </TouchableOpacity>
      )}

      {/* =================================================
          TIÊU ĐỀ DANH SÁCH
      ================================================= */}

      <View
        style={
          styles.listHeader
        }
      >

        <View>
          <Text
            style={
              styles.listTitle
            }
          >
            {selectionMode
              ? "Chọn sách cần xóa"
              : "Danh sách sách"}
          </Text>

          {!selectionMode &&
            activeFilter !==
              "all" && (
              <Text
                style={
                  styles.activeFilterText
                }
              >
                Đang lọc
              </Text>
            )}
        </View>

        <Text
          style={
            styles.resultCount
          }
        >
          {filteredBooks.length} kết quả
        </Text>

      </View>

      {/* =================================================
          DANH SÁCH SÁCH
      ================================================= */}

      <FlatList
        data={
          filteredBooks
        }
        keyExtractor={(
          item
        ) =>
          item.id.toString()
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.listContent
        }
        renderItem={({
          item,
        }) => (

          <BookCard
            book={item}
            onPress={
              handleBookPress
            }
            onLongPress={
              handleLongPress
            }
            selectionMode={
              selectionMode
            }
            selected={
              selectedIds.includes(
                item.id
              )
            }
            onSelect={
              handleSelect
            }
          />

        )}
        ListEmptyComponent={

          <View
            style={
              styles.empty
            }
          >

            <View
              style={
                styles.emptyIconBox
              }
            >
              <Ionicons
                name="library-outline"
                size={42}
                color="#5146E5"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              {books.length === 0
                ? "Tủ sách đang trống"
                : "Không tìm thấy sách"}
            </Text>

            <Text style={styles.emptyText}>
              {books.length === 0
                ? "Bạn chưa có cuốn sách nào. Hãy thêm sách mới để bắt đầu."
                : "Thử thay đổi từ khóa hoặc bộ lọc của bạn."}
            </Text>

            {books.length === 0 && (
              <TouchableOpacity
                style={styles.emptyAddButton}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("AddBook")}
              >
                <Ionicons
                  name="add-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.emptyAddButtonText}>
                  Thêm sách
                </Text>
              </TouchableOpacity>
            )}

          </View>
        }
      />

      {/* =================================================
          THANH XÓA
      ================================================= */}

      {selectionMode && (

        <View
          style={
            styles.deleteBar
          }
        >

          <Text
            style={
              styles.deleteInfo
            }
          >
            {selectedIds.length} sách
          </Text>

          <TouchableOpacity
            style={[
              styles.deleteButton,

              selectedIds.length ===
                0 &&
                styles.deleteButtonDisabled,
            ]}
            disabled={
              selectedIds.length ===
              0
            }
            onPress={
              handleDeleteSelected
            }
          >

            <Ionicons
              name="trash-outline"
              size={18}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.deleteButtonText
              }
            >
              Xóa đã chọn
            </Text>

          </TouchableOpacity>

        </View>
      )}

      {/* =================================================
          MODAL XÁC NHẬN XÓA
      ================================================= */}

      <Modal
        visible={
          showDeleteModal
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowDeleteModal(
            false
          )
        }
      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <View
            style={
              styles.deleteModal
            }
          >

            <View
              style={
                styles.deleteIconCircle
              }
            >

              <Ionicons
                name="trash-outline"
                size={28}
                color="#EF4444"
              />

            </View>

            <Text
              style={
                styles.modalTitle
              }
            >
              Xóa sách?
            </Text>

            <Text
              style={
                styles.modalMessage
              }
            >
              Bạn có chắc muốn xóa{" "}

              <Text
                style={
                  styles.boldText
                }
              >
                {selectedIds.length} cuốn sách
              </Text>

              {" "}đã chọn?
            </Text>

            <View
              style={
                styles.modalButtons
              }
            >

              <TouchableOpacity
                style={
                  styles.cancelModalButton
                }
                activeOpacity={
                  0.8
                }
                onPress={() =>
                  setShowDeleteModal(
                    false
                  )
                }
              >

                <Text
                  style={
                    styles.cancelModalText
                  }
                >
                  Hủy
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.confirmDeleteButton
                }
                activeOpacity={
                  0.8
                }
                onPress={async () => {

                  setShowDeleteModal(
                    false
                  );

                  await performDelete();

                }}
              >

                <Text
                  style={
                    styles.confirmDeleteText
                  }
                >
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

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    // ===================================================
    // CONTAINER
    // ===================================================

    container: {
      flex: 1,
      backgroundColor:
        "#F7F8FC",
      paddingHorizontal: 16,
    },

    // ===================================================
    // HEADER
    // ===================================================

    header: {
      flexDirection: "row",
      justifyContent:
        "space-between",
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
      backgroundColor:
        "#EEF0FF",
      justifyContent:
        "center",
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

    // ===================================================
    // SEARCH
    // ===================================================

    searchRow: {
      marginBottom: 12,
    },

    searchContainer: {
      height: 54,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#E4E7EE",
      paddingHorizontal: 14,
    },

    searchIcon: {
      marginRight: 8,
    },

    search: {
      flex: 1,
      height: 54,
      fontSize: 14,
      color: "#1F2937",
    },

    // ===================================================
    // FILTER
    // ===================================================

    filterSection: {
      marginBottom: 16,
    },

    filterHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 9,
    },

    filterTitle: {
      fontSize: 14,
      fontWeight: "800",
      color: "#20283A",
    },

    filterHint: {
      fontSize: 11,
      color: "#9AA3B2",
    },

    filterList: {
      paddingRight: 8,
      gap: 8,
    },

    filterChip: {
      height: 42,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E1E5EC",
      gap: 6,
    },

    filterChipActive: {
      backgroundColor:
        "#5146E5",
      borderColor:
        "#5146E5",
    },

    filterChipText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#596273",
    },

    filterChipTextActive: {
      color: "#FFFFFF",
    },

    filterCount: {
      minWidth: 20,
      height: 20,
      paddingHorizontal: 5,
      borderRadius: 10,
      backgroundColor:
        "#F0F2F7",
      color: "#687386",
      fontSize: 10,
      fontWeight: "800",
      textAlign: "center",
      lineHeight: 20,
    },

    filterCountActive: {
      backgroundColor:
        "rgba(255,255,255,0.22)",
      color: "#FFFFFF",
    },

    // ===================================================
    // ACTIVE FILTER
    // ===================================================

    activeFilterText: {
      marginTop: 3,
      fontSize: 10,
      color: "#5146E5",
      fontWeight: "600",
    },

    // ===================================================
    // ADD BUTTON
    // ===================================================

    addButton: {
      height: 54,
      flexDirection: "row",
      justifyContent:
        "center",
      alignItems: "center",
      backgroundColor:
        "#5146E5",
      borderRadius: 16,
      marginBottom: 20,

      shadowColor:
        "#5146E5",

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
      justifyContent:
        "center",
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

    // ===================================================
    // LIST HEADER
    // ===================================================

    listHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
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

    // ===================================================
    // SELECTION
    // ===================================================

    selectionHeader: {
      height: 54,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      paddingHorizontal: 15,
      marginBottom: 16,
      borderWidth: 1,
      borderColor:
        "#E4E7EE",
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

    // ===================================================
    // DELETE BAR
    // ===================================================

    deleteBar: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 15,
      height: 64,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
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
      borderColor:
        "#E6E8EF",
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
      backgroundColor:
        "#E53935",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
    },

    deleteButtonDisabled: {
      backgroundColor:
        "#CBD0D8",
    },

    deleteButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
      marginLeft: 7,
    },

    // ===================================================
    // EMPTY
    // ===================================================

    empty: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      paddingVertical: 50,
      paddingHorizontal: 25,
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        "#E8EAF0",
    },

    emptyIconBox: {
      width: 78,
      height: 78,
      borderRadius: 24,
      backgroundColor:
        "#EEF2FF",
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 14,
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

    // ===================================================
    // STATE
    // ===================================================

    stateContainer: {
      flex: 1,
      backgroundColor: "#F7F8FC",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },

    stateIconBox: {
      width: 78,
      height: 78,
      borderRadius: 24,
      backgroundColor: "#EEF2FF",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },

    errorIconBox: {
      width: 78,
      height: 78,
      borderRadius: 24,
      backgroundColor: "#FEF2F2",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },

    stateTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: "#20283A",
      textAlign: "center",
    },

    stateText: {
      marginTop: 7,
      fontSize: 14,
      lineHeight: 21,
      color: "#8992A4",
      textAlign: "center",
      maxWidth: 320,
    },

    retryButton: {
      marginTop: 20,
      height: 46,
      paddingHorizontal: 22,
      borderRadius: 13,
      backgroundColor: "#5146E5",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },

    retryButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },

    emptyAddButton: {
      marginTop: 18,
      height: 44,
      paddingHorizontal: 18,
      borderRadius: 12,
      backgroundColor: "#5146E5",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    emptyAddButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },

    // ===================================================
    // MODAL
    // ===================================================

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(15, 23, 42, 0.45)",
      justifyContent:
        "center",
      alignItems: "center",
      paddingHorizontal: 28,
    },

    deleteModal: {
      width: "100%",
      maxWidth: 380,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 24,
      padding: 24,
      alignItems: "center",
    },

    deleteIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor:
        "#FEF2F2",
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 16,
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
      backgroundColor:
        "#F2F4F7",
      justifyContent:
        "center",
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
      backgroundColor:
        "#EF4444",
      justifyContent:
        "center",
      alignItems: "center",
    },

    confirmDeleteText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });