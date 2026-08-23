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
  ScrollView,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useFocusEffect,
} from "@react-navigation/native";

import BookCard from "../components/BookCard";

import { Book } from "../models/Book";

import {
  getAllBooks,
  deleteBooks,
} from "../database/bookRepository";

export default function BookListScreen({
  navigation,
}: any) {
  const [books, setBooks] =
    useState<Book[]>([]);

  const [search, setSearch] =
    useState("");

  const [selectionMode, setSelectionMode] =
    useState(false);

  const [selectedIds, setSelectedIds] =
    useState<number[]>([]);

  // =========================
  // BỘ LỌC
  // =========================

  const [activeFilter, setActiveFilter] =
    useState("all");

  // =========================
  // LOAD SÁCH
  // =========================

  const loadBooks = useCallback(
    async () => {
      try {
        const data =
          await getAllBooks();

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
  // LẤY DANH SÁCH THỂ LOẠI
  // =========================

  const categories = useMemo(() => {
    const result =
      Array.from(
        new Set(
          books
            .map((book) =>
              book.category?.trim()
            )
            .filter(Boolean)
        )
      );

    return result;
  }, [books]);

  // =========================
  // LỌC SÁCH
  // =========================

  const filteredBooks = useMemo(() => {
    const keyword =
      search
        .trim()
        .toLowerCase();

    let result = [...books];

    // -------------------------
    // LỌC TRẠNG THÁI
    // -------------------------

    if (
      activeFilter ===
      "available"
    ) {
      result = result.filter(
        (book) =>
          book.status ===
          "available"
      );
    }

    if (
      activeFilter ===
      "borrowed"
    ) {
      result = result.filter(
        (book) =>
          book.status ===
          "borrowed"
      );
    }

    // -------------------------
    // LỌC THEO THỂ LOẠI
    // -------------------------

    if (
      activeFilter !==
        "all" &&
      activeFilter !==
        "available" &&
      activeFilter !==
        "borrowed"
    ) {
      result = result.filter(
        (book) =>
          book.category ===
          activeFilter
      );
    }

    // -------------------------
    // TÌM KIẾM
    // -------------------------

    if (keyword) {
      result = result.filter(
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
    }

    return result;
  }, [
    books,
    search,
    activeFilter,
  ]);

  // =========================
  // MỞ CHI TIẾT SÁCH
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
  // CHỌN NHIỀU
  // =========================

  const handleLongPress = (
    book: Book
  ) => {
    setSelectionMode(true);

    setSelectedIds([
      book.id,
    ]);
  };

  // =========================
  // CHỌN / BỎ CHỌN
  // =========================

  const handleSelect = (
    book: Book
  ) => {
    setSelectedIds(
      (current) => {
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

        return [
          ...current,
          book.id,
        ];
      }
    );
  };

  // =========================
  // THOÁT CHỌN
  // =========================

  const exitSelectionMode =
    () => {
      setSelectionMode(false);

      setSelectedIds([]);
    };

  // =========================
  // CHỌN TẤT CẢ
  // =========================

  const selectAll = () => {
    const ids =
      filteredBooks.map(
        (book) =>
          book.id
      );

    setSelectedIds(ids);
  };

  // =========================
  // XÓA NHIỀU
  // =========================

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

      // =====================
      // WEB
      // =====================

      if (
        typeof window !==
        "undefined"
      ) {
        const confirmed =
          window.confirm(
            message
          );

        if (!confirmed) {
          return;
        }

        try {
          const result =
            await deleteBooks(
              selectedIds
            );

          await loadBooks();

          exitSelectionMode();

          if (
            result.skipped
              .length > 0
          ) {
            window.alert(
              `Đã xóa ${result.deleted} sách.\n\n` +
                `Không xóa được ${result.skipped.length} sách đang được mượn:\n` +
                result.skipped.join(
                  ", "
                )
            );
          } else {
            window.alert(
              `Đã xóa ${result.deleted} sách.`
            );
          }
        } catch (
          error: any
        ) {
          console.log(
            "Delete books error:",
            error
          );

          window.alert(
            error?.message ??
              "Không thể xóa sách."
          );
        }

        return;
      }

      // =====================
      // ANDROID / IOS
      // =====================

      Alert.alert(
        "Xóa sách",
        message,
        [
          {
            text: "Hủy",
            style: "cancel",
          },

          {
            text: "Xóa",
            style: "destructive",

            onPress:
              async () => {
                try {
                  const result =
                    await deleteBooks(
                      selectedIds
                    );

                  await loadBooks();

                  exitSelectionMode();

                  if (
                    result
                      .skipped
                      .length > 0
                  ) {
                    Alert.alert(
                      "Đã xử lý",

                      `Đã xóa ${result.deleted} sách.\n\n` +
                        `Không xóa được ${result.skipped.length} sách đang được mượn:\n` +
                        result.skipped.join(
                          ", "
                        )
                    );
                  } else {
                    Alert.alert(
                      "Thành công",
                      `Đã xóa ${result.deleted} sách.`
                    );
                  }
                } catch (
                  error: any
                ) {
                  console.log(
                    "Delete books error:",
                    error
                  );

                  Alert.alert(
                    "Lỗi",
                    error?.message ??
                      "Không thể xóa sách."
                  );
                }
              },
          },
        ]
      );
    };

  // =========================
  // RESET FILTER
  // =========================

  const resetFilter = () => {
    setActiveFilter(
      "all"
    );

    setSearch("");
  };

  // =========================
  // TÊN FILTER
  // =========================

  const getFilterLabel =
    (
      filter: string
    ) => {
      if (
        filter ===
        "all"
      ) {
        return "Tất cả";
      }

      if (
        filter ===
        "available"
      ) {
        return "Có sẵn";
      }

      if (
        filter ===
        "borrowed"
      ) {
        return "Đang mượn";
      }

      return filter;
    };

  // =========================
  // FILTER BUTTON
  // =========================

  const FilterButton = ({
    type,
    icon,
    label,
  }: {
    type: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }) => {
    const active =
      activeFilter ===
      type;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          setActiveFilter(
            type
          )
        }
        style={[
          styles.filterButton,

          active &&
            styles.filterButtonActive,
        ]}
      >
        <Ionicons
          name={icon}
          size={17}
          color={
            active
              ? "#FFFFFF"
              : "#5B6475"
          }
        />

        <Text
          style={[
            styles.filterText,

            active &&
              styles.filterTextActive,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={
        styles.container
      }
    >
      {/* ================= HEADER ================= */}

      <View
        style={styles.header}
      >
        <View>
          <Text
            style={
              styles.eyebrow
            }
          >
            THƯ VIỆN CÁ NHÂN
          </Text>

          <Text
            style={
              styles.title
            }
          >
            Tủ sách
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            {books.length} cuốn sách trong tủ
          </Text>
        </View>

        <View
          style={
            styles.countBox
          }
        >
          <Ionicons
            name="library-outline"
            size={25}
            color="#5146E5"
          />

          <Text
            style={
              styles.countNumber
            }
          >
            {books.length}
          </Text>
        </View>
      </View>

      {/* ================= CHẾ ĐỘ CHỌN ================= */}

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
        <>
          {/* ================= SEARCH ================= */}

          <View
            style={
              styles.searchContainer
            }
          >
            <Ionicons
              name="search-outline"
              size={20}
              color="#7B8495"
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

            {search.length >
              0 && (
              <TouchableOpacity
                onPress={() =>
                  setSearch(
                    ""
                  )
                }
              >
                <Ionicons
                  name="close-circle"
                  size={19}
                  color="#A1A8B5"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* ================= FILTER ================= */}

          <View
            style={
              styles.filterSection
            }
          >
            <View
              style={
                styles.filterTitleRow
              }
            >
              <View
                style={
                  styles.filterTitleLeft
                }
              >
                <Ionicons
                  name="options-outline"
                  size={17}
                  color="#5146E5"
                />

                <Text
                  style={
                    styles.filterTitle
                  }
                >
                  Bộ lọc
                </Text>
              </View>

              {activeFilter !==
                "all" && (
                <TouchableOpacity
                  onPress={
                    resetFilter
                  }
                >
                  <Text
                    style={
                      styles.resetText
                    }
                  >
                    Xóa lọc
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.filterContent
              }
            >
              {/* TẤT CẢ */}

              <FilterButton
                type="all"
                icon="apps-outline"
                label="Tất cả"
              />

              {/* CÓ SẴN */}

              <FilterButton
                type="available"
                icon="checkmark-circle-outline"
                label="Có sẵn"
              />

              {/* ĐANG MƯỢN */}

              <FilterButton
                type="borrowed"
                icon="time-outline"
                label="Đang mượn"
              />

              {/* THỂ LOẠI */}

              {categories.map(
                (
                  category
                ) => (
                  <FilterButton
                    key={
                      category
                    }
                    type={
                      category
                    }
                    icon="pricetag-outline"
                    label={
                      category
                    }
                  />
                )
              )}
            </ScrollView>
          </View>
        </>
      )}

      {/* ================= NÚT THÊM ================= */}

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
            <Ionicons
              name="add"
              size={23}
              color="#FFFFFF"
            />
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

      {/* ================= TIÊU ĐỀ DANH SÁCH ================= */}

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
                  styles.activeFilterLabel
                }
              >
                Đang lọc:{" "}
                {getFilterLabel(
                  activeFilter
                )}
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

      {/* ================= DANH SÁCH ================= */}

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
            selected={selectedIds.includes(
              item.id
            )}
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
                name="search-outline"
                size={32}
                color="#5146E5"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Không tìm thấy sách
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Thử thay đổi từ khóa
              hoặc bộ lọc để tìm
              sách.
            </Text>

            <TouchableOpacity
              style={
                styles.resetButton
              }
              onPress={
                resetFilter
              }
            >
              <Text
                style={
                  styles.resetButtonText
                }
              >
                Xóa bộ lọc
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* ================= THANH XÓA ================= */}

      {selectionMode && (
        <View
          style={
            styles.deleteBar
          }
        >
          <View
            style={
              styles.deleteInfoBox
            }
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="#5146E5"
            />

            <Text
              style={
                styles.deleteInfo
              }
            >
              {selectedIds.length} sách
            </Text>
          </View>

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
              size={17}
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
      backgroundColor:
        "#F8F9FD",
      paddingHorizontal: 16,
    },

    // ================= HEADER =================

    header: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      paddingTop: 20,
      paddingBottom: 16,
    },

    eyebrow: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.4,
      color: "#5146E5",
      marginBottom: 5,
    },

    title: {
      fontSize: 29,
      fontWeight: "800",
      color: "#172033",
    },

    subtitle: {
      marginTop: 5,
      fontSize: 13,
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
      alignItems:
        "center",
    },

    countNumber: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: "800",
      color: "#5146E5",
    },

    // ================= SEARCH =================

    searchContainer: {
      height: 54,
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#E4E7EE",
      paddingHorizontal: 14,
      marginBottom: 12,
    },

    search: {
      flex: 1,
      height: 54,
      marginLeft: 9,
      fontSize: 14,
      color: "#1F2937",
    },

    // ================= FILTER =================

    filterSection: {
      marginBottom: 14,
    },

    filterTitleRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginBottom: 9,
    },

    filterTitleLeft: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    filterTitle: {
      marginLeft: 6,
      fontSize: 14,
      fontWeight: "800",
      color: "#30394A",
    },

    resetText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#5146E5",
    },

    filterContent: {
      paddingRight: 10,
    },

    filterButton: {
      height: 40,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 13,
      borderRadius: 13,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E6EE",
      marginRight: 8,
    },

    filterButtonActive: {
      backgroundColor:
        "#5146E5",
      borderColor:
        "#5146E5",
    },

    filterText: {
      marginLeft: 6,
      fontSize: 12,
      fontWeight: "700",
      color: "#64748B",
    },

    filterTextActive: {
      color: "#FFFFFF",
    },

    // ================= ADD =================

    addButton: {
      height: 52,
      flexDirection:
        "row",
      justifyContent:
        "center",
      alignItems:
        "center",
      backgroundColor:
        "#5146E5",
      borderRadius: 16,
      marginBottom: 18,

      shadowColor:
        "#5146E5",
      shadowOpacity:
        0.22,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 4,
    },

    addIcon: {
      width: 27,
      height: 27,
      borderRadius: 9,
      backgroundColor:
        "rgba(255,255,255,0.2)",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 9,
    },

    addButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
    },

    // ================= LIST =================

    listHeader: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginBottom: 10,
    },

    listTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#20283A",
    },

    activeFilterLabel: {
      marginTop: 3,
      fontSize: 11,
      color: "#5146E5",
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
      flexDirection:
        "row",
      alignItems:
        "center",
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

    // ================= DELETE =================

    deleteBar: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 15,
      height: 64,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      paddingHorizontal: 12,

      shadowColor:
        "#000",
      shadowOpacity:
        0.12,
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

    deleteInfoBox: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginLeft: 6,
    },

    deleteInfo: {
      marginLeft: 7,
      color: "#596273",
      fontSize: 14,
      fontWeight: "600",
    },

    deleteButton: {
      height: 44,
      paddingHorizontal: 17,
      borderRadius: 12,
      backgroundColor:
        "#E53935",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    deleteButtonDisabled: {
      backgroundColor:
        "#CBD0D8",
    },

    deleteButtonText: {
      marginLeft: 7,
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },

    // ================= EMPTY =================

    empty: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      paddingVertical: 50,
      paddingHorizontal: 25,
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        "#E8EAF0",
    },

    emptyIconBox: {
      width: 70,
      height: 70,
      borderRadius: 22,
      backgroundColor:
        "#EEF2FF",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom: 12,
    },

    emptyTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: "#293246",
    },

    emptyText: {
      marginTop: 6,
      textAlign:
        "center",
      color: "#8B94A5",
      fontSize: 13,
      lineHeight: 20,
    },

    resetButton: {
      marginTop: 15,
      backgroundColor:
        "#EEF2FF",
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 10,
    },

    resetButtonText: {
      color: "#4F46E5",
      fontSize: 12,
      fontWeight: "700",
    },
  });