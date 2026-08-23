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
  TouchableOpacity,
  RefreshControl,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import SearchBar from "../components/SearchBar";
import { getAllBooks } from "../database/bookRepository";
import { Book } from "../models/Book";

type FilterType =
  | "all"
  | "title"
  | "author"
  | "category";

export default function SearchScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] =
    useState<FilterType>("all");

  const [refreshing, setRefreshing] =
    useState(false);

  const loadBooks = useCallback(async () => {
    try {
      const data = await getAllBooks();
      setBooks(data);
    } catch (error) {
      console.log(
        "Lỗi tải danh sách sách:",
        error
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
  };

  const filteredBooks = useMemo(() => {
    const text = keyword
      .trim()
      .toLowerCase();

    if (text === "") {
      return books;
    }

    return books.filter((book) => {
      switch (filter) {
        case "title":
          return book.title
            .toLowerCase()
            .includes(text);

        case "author":
          return book.author
            .toLowerCase()
            .includes(text);

        case "category":
          return book.category
            .toLowerCase()
            .includes(text);

        default:
          return (
            book.title
              .toLowerCase()
              .includes(text) ||
            book.author
              .toLowerCase()
              .includes(text) ||
            book.category
              .toLowerCase()
              .includes(text)
          );
      }
    });
  }, [books, keyword, filter]);

  const renderFilter = (
    type: FilterType,
    label: string
  ) => {
    const active = filter === type;

    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          active && styles.filterButtonActive,
        ]}
        onPress={() => setFilter(type)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.filterText,
            active && styles.filterTextActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderBook = ({
    item,
  }: {
    item: Book;
  }) => {
    const isAvailable =
      item.status === "available";

    return (
      <View style={styles.bookCard}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.bookImage}
          />
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageIcon}>
              📚
            </Text>
          </View>
        )}

        <View style={styles.bookInfo}>
          <Text
            style={styles.bookTitle}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>
              ✍
            </Text>
            <Text
              style={styles.infoText}
              numberOfLines={1}
            >
              {item.author}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>
              ◈
            </Text>
            <Text
              style={styles.infoText}
              numberOfLines={1}
            >
              {item.category}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              isAvailable
                ? styles.availableBadge
                : styles.borrowedBadge,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isAvailable
                  ? styles.availableDot
                  : styles.borrowedDot,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                isAvailable
                  ? styles.availableText
                  : styles.borrowedText,
              ]}
            >
              {isAvailable
                ? "Có sẵn"
                : "Đang mượn"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderBook}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={
          filteredBooks.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.smallTitle}>
                  THƯ VIỆN
                </Text>

                <Text style={styles.headerTitle}>
                  Tìm kiếm sách
                </Text>

                <Text style={styles.subtitle}>
                  Tìm cuốn sách bạn muốn đọc
                </Text>
              </View>

              <View style={styles.headerIcon}>
                <Text style={styles.headerIconText}>
                  📚
                </Text>
              </View>
            </View>

            <SearchBar
              value={keyword}
              onChangeText={setKeyword}
              placeholder="Tên sách, tác giả..."
            />

            <FlatList
              horizontal
              data={[
                {
                  type: "all" as FilterType,
                  label: "Tất cả",
                },
                {
                  type: "title" as FilterType,
                  label: "Tên sách",
                },
                {
                  type: "author" as FilterType,
                  label: "Tác giả",
                },
                {
                  type: "category" as FilterType,
                  label: "Thể loại",
                },
              ]}
              keyExtractor={(item) =>
                item.type
              }
              renderItem={({ item }) =>
                renderFilter(
                  item.type,
                  item.label
                )
              }
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.filterList
              }
            />

            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>
                Danh sách sách
              </Text>

              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {filteredBooks.length}
                </Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconBox}>
              <Text style={styles.emptyIcon}>
                🔎
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              Không tìm thấy sách
            </Text>

            <Text style={styles.emptyText}>
              Hãy thử từ khóa hoặc bộ lọc khác.
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
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
  },

  list: {
    paddingBottom: 30,
  },

  emptyContainer: {
    flexGrow: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 18,
  },

  smallTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6366F1",
    letterSpacing: 2,
    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 5,
  },

  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },

  headerIconText: {
    fontSize: 28,
  },

  filterList: {
    gap: 8,
    paddingBottom: 20,
  },

  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  filterButtonActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },

  filterText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  countBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    paddingHorizontal: 8,
  },

  countText: {
    color: "#4F46E5",
    fontSize: 13,
    fontWeight: "800",
  },

  bookCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 13,
    flexDirection: "row",

    shadowColor: "#1E293B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,

    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  bookImage: {
    width: 88,
    height: 118,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
  },

  noImage: {
    width: 88,
    height: 118,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },

  noImageIcon: {
    fontSize: 34,
  },

  bookInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },

  bookTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 9,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  infoIcon: {
    width: 22,
    fontSize: 14,
    color: "#6366F1",
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#64748B",
  },

  statusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 4,
  },

  availableBadge: {
    backgroundColor: "#ECFDF5",
  },

  borrowedBadge: {
    backgroundColor: "#FFF7ED",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  availableDot: {
    backgroundColor: "#10B981",
  },

  borrowedDot: {
    backgroundColor: "#F97316",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  availableText: {
    color: "#059669",
  },

  borrowedText: {
    color: "#EA580C",
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 80,
  },

  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  emptyIcon: {
    fontSize: 35,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 7,
  },

  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
});