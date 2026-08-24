import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getAllBooks } from "../database/bookRepository";
import { getDatabase } from "../database/database";
import { Book } from "../models/Book";

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowedCount, setBorrowedCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // TẢI DỮ LIỆU DASHBOARD
  // =====================================================
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getAllBooks();

      setBooks(data);

      // Đếm sách đang mượn từ trạng thái sách
      const borrowed = data.filter(
        (book) => book.status === "borrowed"
      ).length;

      setBorrowedCount(borrowed);

      // =================================================
      // ĐẾM SÁCH QUÁ HẠN
      // =================================================
      try {
        const db = getDatabase();

        const today = new Date()
          .toISOString()
          .split("T")[0];

        const overdue = await db.getFirstAsync<{
          count: number;
        }>(
          `
          SELECT COUNT(*) as count
          FROM BorrowHistory
          WHERE returnDate IS NULL
          AND dueDate < ?
          `,
          [today]
        );

        setOverdueCount(
          overdue?.count ?? 0
        );
      } catch (error) {
        console.log(
          "Không thể lấy số sách quá hạn:",
          error
        );

        setOverdueCount(0);
      }
    } catch (error) {
      console.log(
        "Không thể tải dashboard:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload mỗi khi quay lại Home
  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  // =====================================================
  // DỮ LIỆU THỐNG KÊ
  // =====================================================

  const totalBooks = books.length;

  const availableCount = books.filter(
    (book) => book.status === "available"
  ).length;

  // 3 sách mới nhất
  const recentBooks = books.slice(0, 3);

  // =====================================================
  // GREETING
  // =====================================================

  const currentHour = new Date().getHours();

  let greeting = "Chào bạn";

  if (currentHour >= 5 && currentHour < 12) {
    greeting = "Chào buổi sáng";
  } else if (
    currentHour >= 12 &&
    currentHour < 18
  ) {
    greeting = "Chào buổi chiều";
  } else {
    greeting = "Chào buổi tối";
  }

  // =====================================================
  // CARD THỐNG KÊ
  // =====================================================

  const renderStatCard = (
    icon: keyof typeof Ionicons.glyphMap,
    number: number,
    title: string,
    subtitle: string,
    backgroundColor: string,
    iconBackground: string,
    iconColor: string
  ) => {
    return (
      <View
        style={[
          styles.statCard,
          {
            backgroundColor,
          },
        ]}
      >
        <View
          style={[
            styles.statIcon,
            {
              backgroundColor: iconBackground,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={21}
            color={iconColor}
          />
        </View>

        <Text style={styles.statNumber}>
          {number}
        </Text>

        <Text style={styles.statTitle}>
          {title}
        </Text>

        <Text style={styles.statSubtitle}>
          {subtitle}
        </Text>
      </View>
    );
  };

  // =====================================================
  // CARD SÁCH
  // =====================================================

  const renderBook = ({
    item,
  }: {
    item: Book;
  }) => {
    const isAvailable =
      item.status === "available";

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={styles.bookCard}
        onPress={() =>
          navigation.navigate(
            "Books",
            {
              screen: "BookDetail",
              params: {
                bookId: item.id,
              },
            }
          )
        }
      >
        <View style={styles.bookImageWrapper}>
          {item.image ? (
            <Image
              source={{
                uri: item.image,
              }}
              style={styles.bookImage}
            />
          ) : (
            <View
              style={styles.imagePlaceholder}
            >
              <Ionicons
                name="book-outline"
                size={27}
                color="#98A2B3"
              />
            </View>
          )}
        </View>

        <View style={styles.bookInfo}>
          <Text
            style={styles.bookTitle}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text
            style={styles.bookAuthor}
            numberOfLines={1}
          >
            {item.author}
          </Text>

          <View style={styles.bookBottom}>
            <View style={styles.categoryBadge}>
              <Text
                style={styles.categoryText}
                numberOfLines={1}
              >
                {item.category}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    isAvailable
                      ? "#ECFDF3"
                      : "#FFF7E8",
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      isAvailable
                        ? "#12B76A"
                        : "#F79009",
                  },
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      isAvailable
                        ? "#027A48"
                        : "#B54708",
                  },
                ]}
              >
                {isAvailable
                  ? "Có sẵn"
                  : "Đang mượn"}
              </Text>
            </View>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={19}
          color="#98A2B3"
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>

        <ActivityIndicator
          size="large"
          color="#5146E5"
        />

        <Text style={styles.loadingText}>
          Đang tải tủ sách...
        </Text>
      </View>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={recentBooks}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderBook}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
        ListHeaderComponent={
          <>
            {/* ================= HEADER ================= */}

            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.eyebrow}>
                  THƯ VIỆN CÁ NHÂN
                </Text>

                <Text style={styles.title}>
                  Quản lý thư viện
                </Text>

                <Text style={styles.welcome}>
                  {greeting}, chúc bạn một ngày
                  đọc sách thật vui! 👋
                </Text>
              </View>

              <View
                style={styles.headerIcon}
              >
                <Ionicons
                  name="library-outline"
                  size={28}
                  color="#5146E5"
                />
              </View>
            </View>

            {/* ================= STATS ================= */}

            <View style={styles.statsGrid}>
              {renderStatCard(
                "library-outline",
                totalBooks,
                "Tổng số sách",
                "Sách trong tủ",
                "#FFFFFF",
                "#EEF0FF",
                "#5146E5"
              )}

              {renderStatCard(
                "book-outline",
                borrowedCount,
                "Đang mượn",
                "Chưa được trả",
                "#F8FBFF",
                "#EAF4FF",
                "#3B82F6"
              )}

              {renderStatCard(
                "checkmark-circle-outline",
                availableCount,
                "Có sẵn",
                "Có thể cho mượn",
                "#F7FCF9",
                "#E9F8EF",
                "#12B76A"
              )}

              {renderStatCard(
                "time-outline",
                overdueCount,
                "Sách quá hạn",
                overdueCount > 0
                  ? "Cần kiểm tra"
                  : "Không có quá hạn",
                "#FFFBF5",
                "#FFF1D6",
                "#F79009"
              )}
            </View>

            {/* ================= QUICK ACTION ================= */}

            <View
              style={styles.sectionHeader}
            >
              <Text
                style={styles.sectionTitle}
              >
                Thao tác nhanh
              </Text>
            </View>

            <View
              style={styles.quickActions}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.quickAction}
                onPress={() =>
                  navigation.navigate(
                    "Books",
                    {
                      screen: "AddBook",
                    }
                  )
                }
              >
                <View
                  style={[
                    styles.quickIcon,
                    {
                      backgroundColor:
                        "#EEF0FF",
                    },
                  ]}
                >
                  <Ionicons
                    name="add"
                    size={25}
                    color="#5146E5"
                  />
                </View>

                <View
                  style={
                    styles.quickText
                  }
                >
                  <Text
                    style={
                      styles.quickTitle
                    }
                  >
                    Thêm sách
                  </Text>

                  <Text
                    style={
                      styles.quickSubtitle
                    }
                  >
                    Thêm vào tủ sách
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#98A2B3"
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.quickAction}
                onPress={() =>
                  navigation.navigate(
                    "Books"
                  )
                }
              >
                <View
                  style={[
                    styles.quickIcon,
                    {
                      backgroundColor:
                        "#EAF4FF",
                    },
                  ]}
                >
                  <Ionicons
                    name="library-outline"
                    size={23}
                    color="#3B82F6"
                  />
                </View>

                <View
                  style={
                    styles.quickText
                  }
                >
                  <Text
                    style={
                      styles.quickTitle
                    }
                  >
                    Tủ sách
                  </Text>

                  <Text
                    style={
                      styles.quickSubtitle
                    }
                  >
                    Xem tất cả sách
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#98A2B3"
                />
              </TouchableOpacity>
            </View>

            {/* ================= RECENT BOOKS ================= */}

            <View
              style={[
                styles.sectionHeader,
                styles.recentHeader,
              ]}
            >
              <Text
                style={styles.sectionTitle}
              >
                Sách mới thêm
              </Text>

              {totalBooks > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(
                      "Books"
                    )
                  }
                >
                  <Text
                    style={styles.seeAll}
                  >
                    Xem tất cả
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {recentBooks.length === 0 && (
              <View
                style={styles.emptyCard}
              >
                <View
                  style={
                    styles.emptyIcon
                  }
                >
                  <Ionicons
                    name="book-outline"
                    size={28}
                    color="#98A2B3"
                  />
                </View>

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  Tủ sách đang trống
                </Text>

                <Text
                  style={
                    styles.emptySubtitle
                  }
                >
                  Hãy thêm cuốn sách đầu tiên
                  của bạn.
                </Text>

                <TouchableOpacity
                  style={
                    styles.emptyButton
                  }
                  onPress={() =>
                    navigation.navigate(
                      "Books",
                      {
                        screen:
                          "AddBook",
                      }
                    )
                  }
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.emptyButtonText
                    }
                  >
                    Thêm sách
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        ListFooterComponent={
          recentBooks.length > 0 ? (
            <View
              style={
                styles.footerSpace
              }
            />
          ) : null
        }
      />
    </View>
  );
}

// =======================================================
// STYLES
// =======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },

  content: {
    paddingHorizontal: 17,
    paddingTop: 20,
    paddingBottom: 30,
  },

  // ---------------- HEADER ----------------

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: "#5146E5",
    marginBottom: 7,
  },

  title: {
    fontSize: 29,
    fontWeight: "700",
    color: "#172033",
    letterSpacing: -0.5,
  },

  welcome: {
    marginTop: 7,
    fontSize: 14,
    color: "#667085",
    lineHeight: 20,
  },

  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: "#EEF0FF",
    justifyContent: "center",
    alignItems: "center",
  },

  // ---------------- STATS ----------------

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  statCard: {
    width: "48.1%",
    minHeight: 132,
    borderRadius: 19,
    padding: 15,
    borderWidth: 1,
    borderColor: "#EAECF0",
    position: "relative",
  },

  statIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 9,
  },

  statNumber: {
    position: "absolute",
    right: 15,
    top: 15,
    fontSize: 25,
    fontWeight: "700",
    color: "#172033",
  },

  statTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#344054",
  },

  statSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#98A2B3",
  },

  // ---------------- SECTION ----------------

  sectionHeader: {
    marginTop: 27,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  recentHeader: {
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#172033",
  },

  seeAll: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5146E5",
  },

  // ---------------- QUICK ACTION ----------------

  quickActions: {
    flexDirection: "row",
    gap: 11,
  },

  quickAction: {
    flex: 1,
    minHeight: 83,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#EAECF0",
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },

  quickText: {
    flex: 1,
    marginLeft: 9,
  },

  quickTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#172033",
  },

  quickSubtitle: {
    fontSize: 11,
    color: "#98A2B3",
    marginTop: 3,
  },

  // ---------------- BOOK CARD ----------------

  bookCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EAECF0",
    padding: 11,
    marginBottom: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  bookImageWrapper: {
    width: 67,
    height: 88,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F2F4F7",
  },

  bookImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  bookInfo: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  bookTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#172033",
  },

  bookAuthor: {
    fontSize: 12,
    color: "#667085",
    marginTop: 4,
  },

  bookBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
    gap: 7,
  },

  categoryBadge: {
    backgroundColor: "#EEF0FF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 110,
  },

  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#5146E5",
  },

  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 4,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },

  chevron: {
    marginLeft: 5,
  },

  // ---------------- EMPTY ----------------

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#EAECF0",
    paddingVertical: 27,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  emptyIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: "#F2F4F7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#344054",
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#98A2B3",
    marginTop: 5,
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 15,
    height: 40,
    paddingHorizontal: 17,
    borderRadius: 11,
    backgroundColor: "#5146E5",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  // ---------------- LOADING ----------------

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F6F8FC",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#667085",
  },

  footerSpace: {
    height: 20,
  },
});