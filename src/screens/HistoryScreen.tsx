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
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import {
  getBorrowHistory,
} from "../database/borrowRepository";

type HistoryItem = {
  id: number;
  bookId: number;
  borrower: string;
  phone: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  title: string;
  author: string;
  image?: string;
};

type FilterType =
  | "all"
  | "borrowing"
  | "returned";

export default function HistoryScreen() {
  // =====================================================
  // STATE
  // =====================================================

  const [history, setHistory] =
    useState<HistoryItem[]>([]);

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [refreshing, setRefreshing] =
    useState(false);

  // =====================================================
  // LOAD LỊCH SỬ
  // =====================================================

  const loadData =
    useCallback(
      async (
        showLoading = true
      ) => {
        try {
          if (showLoading) {
            setLoading(true);
          }

          setError(null);

          const data =
            await getBorrowHistory();

          setHistory(
            data as HistoryItem[]
          );
        } catch (error) {
          console.log(
            "Lỗi tải lịch sử:",
            error
          );

          setError(
            "Không thể tải lịch sử mượn trả."
          );
        } finally {
          if (showLoading) {
            setLoading(false);
          }
        }
      },
      []
    );

  // =====================================================
  // LOAD KHI MỞ TRANG
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      loadData(true);
    }, [loadData])
  );

  // =====================================================
  // REFRESH
  // =====================================================

  const onRefresh =
    async () => {
      try {
        setRefreshing(true);
        await loadData(false);
      } finally {
        setRefreshing(false);
      }
    };

  // =====================================================
  // RETRY
  // =====================================================

  const handleRetry =
    async () => {
      await loadData(true);
    };

  // =====================================================
  // THỐNG KÊ
  // =====================================================

  const statistics =
    useMemo(() => {
      const total =
        history.length;

      const borrowing =
        history.filter(
          (item) =>
            !item.returnDate
        ).length;

      const returned =
        history.filter(
          (item) =>
            !!item.returnDate
        ).length;

      return {
        total,
        borrowing,
        returned,
      };
    }, [history]);

  // =====================================================
  // LỌC
  // =====================================================

  const filteredHistory =
    useMemo(() => {
      if (
        filter ===
        "borrowing"
      ) {
        return history.filter(
          (item) =>
            !item.returnDate
        );
      }

      if (
        filter ===
        "returned"
      ) {
        return history.filter(
          (item) =>
            !!item.returnDate
        );
      }

      return history;
    }, [
      history,
      filter,
    ]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) {
      return "Chưa trả";
    }

    const parts =
      date.split("-");

    if (
      parts.length === 3
    ) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return date;
  };

  // =====================================================
  // KIỂM TRA QUÁ HẠN
  // =====================================================

  const isOverdue = (
    item: HistoryItem
  ) => {
    if (item.returnDate) {
      return false;
    }

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    return item.dueDate <
      today;
  };

  // =====================================================
  // FILTER BUTTON
  // =====================================================

  const FilterButton = ({
    type,
    icon,
    label,
    count,
  }: {
    type: FilterType;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    count: number;
  }) => {
    const active =
      filter === type;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          setFilter(type)
        }
        style={[
          styles.filterButton,
          active &&
            styles.filterButtonActive,
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={
            active
              ? "#FFFFFF"
              : "#64748B"
          }
          style={
            styles.filterIcon
          }
        />

        <Text
          style={[
            styles.filterText,
            active &&
              styles.filterTextActive,
          ]}
        >
          {label}
        </Text>

        <View
          style={[
            styles.filterCount,
            active &&
              styles.filterCountActive,
          ]}
        >
          <Text
            style={[
              styles.filterCountText,
              active &&
                styles.filterCountTextActive,
            ]}
          >
            {count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <View
        style={
          styles.stateContainer
        }
      >
        <View
          style={
            styles.stateIconBox
          }
        >
          <ActivityIndicator
            size="large"
            color="#5146E5"
          />
        </View>

        <Text
          style={
            styles.stateTitle
          }
        >
          Đang tải
        </Text>

        <Text
          style={
            styles.stateText
          }
        >
          Đang lấy lịch sử mượn trả...
        </Text>
      </View>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <View
        style={
          styles.stateContainer
        }
      >
        <View
          style={[
            styles.stateIconBox,
            styles.errorIconBox,
          ]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={42}
            color="#DC2626"
          />
        </View>

        <Text
          style={
            styles.stateTitle
          }
        >
          Không thể tải dữ liệu
        </Text>

        <Text
          style={
            styles.stateText
          }
        >
          {error}
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.retryButton
          }
          onPress={
            handleRetry
          }
        >
          <Ionicons
            name="refresh-outline"
            size={18}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.retryText
            }
          >
            Thử lại
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // =====================================================
  // RENDER ITEM
  // =====================================================

  const renderItem = ({
    item,
  }: {
    item: HistoryItem;
  }) => {
    const returned =
      !!item.returnDate;

    const overdue =
      isOverdue(item);

    return (
      <View
        style={styles.card}
      >
        {item.image ? (
          <Image
            source={{
              uri: item.image,
            }}
            style={
              styles.bookImage
            }
          />
        ) : (
          <View
            style={
              styles.bookImagePlaceholder
            }
          >
            <Ionicons
              name="library-outline"
              size={36}
              color="#5146E5"
            />
          </View>
        )}

        <View
          style={
            styles.cardContent
          }
        >
          <View
            style={
              styles.titleRow
            }
          >
            <Text
              style={
                styles.bookTitle
              }
              numberOfLines={2}
            >
              {item.title}
            </Text>

            <View
              style={[
                styles.statusBadge,
                returned
                  ? styles.returnedBadge
                  : overdue
                  ? styles.overdueBadge
                  : styles.borrowingBadge,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  returned
                    ? styles.returnedDot
                    : overdue
                    ? styles.overdueDot
                    : styles.borrowingDot,
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  returned
                    ? styles.returnedText
                    : overdue
                    ? styles.overdueText
                    : styles.borrowingText,
                ]}
              >
                {returned
                  ? "Đã trả"
                  : overdue
                  ? "Quá hạn"
                  : "Đang mượn"}
              </Text>
            </View>
          </View>

          <Text
            style={styles.author}
            numberOfLines={1}
          >
            {item.author}
          </Text>

          <View
            style={styles.infoRow}
          >
            <Ionicons
              name="person-outline"
              size={16}
              color="#64748B"
              style={
                styles.infoIcon
              }
            />

            <Text
              style={
                styles.infoText
              }
            >
              {item.borrower}
            </Text>
          </View>

          <View
            style={styles.infoRow}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#64748B"
              style={
                styles.infoIcon
              }
            />

            <Text
              style={
                styles.infoText
              }
            >
              Mượn:{" "}
              {formatDate(
                item.borrowDate
              )}
            </Text>
          </View>

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
              style={
                styles.infoIcon
              }
            />

            <Text
              style={[
                styles.infoText,
                overdue &&
                  styles.overdueInfo,
              ]}
            >
              Hạn trả:{" "}
              {formatDate(
                item.dueDate
              )}
            </Text>
          </View>

          {returned && (
            <View
              style={
                styles.infoRow
              }
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color="#059669"
                style={
                  styles.infoIcon
                }
              />

              <Text
                style={
                  styles.returnDateText
                }
              >
                Trả:{" "}
                {formatDate(
                  item.returnDate
                )}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // =====================================================
  // SUCCESS / EMPTY
  // =====================================================

  return (
    <View
      style={styles.container}
    >
      <FlatList
        data={
          filteredHistory
        }
        keyExtractor={(
          item
        ) =>
          item.id.toString()
        }
        renderItem={
          renderItem
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
          />
        }
        contentContainerStyle={
          filteredHistory.length ===
          0
            ? styles.emptyList
            : styles.list
        }
        ListHeaderComponent={
          <>
            {/* HEADER */}

            <View
              style={styles.header}
            >
              <View>
                <Text
                  style={
                    styles.smallTitle
                  }
                >
                  THƯ VIỆN
                </Text>

                <Text
                  style={
                    styles.headerTitle
                  }
                >
                  Lịch sử mượn trả
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  Theo dõi quá trình mượn và trả sách
                </Text>
              </View>

              <View
                style={
                  styles.headerIcon
                }
              >
                <Ionicons
                  name="library-outline"
                  size={34}
                  color="#5146E5"
                />
              </View>
            </View>

            {/* STATISTICS */}

            <View
              style={
                styles.statistics
              }
            >
              <View
                style={
                  styles.statCard
                }
              >
                <View
                  style={[
                    styles.statIcon,
                    styles.totalIcon,
                  ]}
                >
                  <Ionicons
                    name="library-outline"
                    size={22}
                    color="#5146E5"
                  />
                </View>

                <Text
                  style={
                    styles.statNumber
                  }
                >
                  {statistics.total}
                </Text>

                <Text
                  style={
                    styles.statLabel
                  }
                >
                  Tổng lượt
                </Text>
              </View>

              <View
                style={
                  styles.statCard
                }
              >
                <View
                  style={[
                    styles.statIcon,
                    styles.borrowingIcon,
                  ]}
                >
                  <Ionicons
                    name="book-outline"
                    size={22}
                    color="#EA580C"
                  />
                </View>

                <Text
                  style={
                    styles.statNumber
                  }
                >
                  {
                    statistics.borrowing
                  }
                </Text>

                <Text
                  style={
                    styles.statLabel
                  }
                >
                  Đang mượn
                </Text>
              </View>

              <View
                style={
                  styles.statCard
                }
              >
                <View
                  style={[
                    styles.statIcon,
                    styles.returnedIcon,
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={22}
                    color="#059669"
                  />
                </View>

                <Text
                  style={
                    styles.statNumber
                  }
                >
                  {
                    statistics.returned
                  }
                </Text>

                <Text
                  style={
                    styles.statLabel
                  }
                >
                  Đã trả
                </Text>
              </View>
            </View>

            {/* FILTER */}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Bộ lọc
            </Text>

            <View
              style={
                styles.filterContainer
              }
            >
              <FilterButton
                type="all"
                icon="library-outline"
                label="Tất cả"
                count={
                  statistics.total
                }
              />

              <FilterButton
                type="borrowing"
                icon="book-outline"
                label="Đang mượn"
                count={
                  statistics.borrowing
                }
              />

              <FilterButton
                type="returned"
                icon="checkmark-circle-outline"
                label="Đã trả"
                count={
                  statistics.returned
                }
              />
            </View>

            {/* LIST TITLE */}

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
                  Danh sách lịch sử
                </Text>

                <Text
                  style={
                    styles.listSubtitle
                  }
                >
                  {
                    filteredHistory.length
                  }{" "}
                  kết quả
                </Text>
              </View>
            </View>
          </>
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
                name="library-outline"
                size={38}
                color="#5146E5"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Chưa có lịch sử
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Chưa có dữ liệu phù hợp với bộ lọc hiện tại.
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
      backgroundColor:
        "#F8FAFC",
      paddingHorizontal: 16,
    },

    list: {
      paddingBottom: 30,
    },

    emptyList: {
      flexGrow: 1,
    },

    // ================= STATE =================

    stateContainer: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
    },

    stateIconBox: {
      width: 88,
      height: 88,
      borderRadius: 28,
      backgroundColor:
        "#EEF2FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 18,
    },

    errorIconBox: {
      backgroundColor:
        "#FEF2F2",
    },

    stateTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: "#111827",
      textAlign: "center",
    },

    stateText: {
      fontSize: 13,
      color: "#94A3B8",
      textAlign: "center",
      marginTop: 7,
      lineHeight: 20,
    },

    retryButton: {
      marginTop: 18,
      height: 44,
      paddingHorizontal: 18,
      borderRadius: 13,
      backgroundColor:
        "#5146E5",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 7,
    },

    retryText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
    },

    // ================= HEADER =================

    header: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      paddingTop: 20,
      paddingBottom: 18,
    },

    smallTitle: {
      fontSize: 12,
      fontWeight: "800",
      color: "#4F46E5",
      letterSpacing: 2,
      marginBottom: 4,
    },

    headerTitle: {
      fontSize: 27,
      fontWeight: "800",
      color: "#111827",
    },

    subtitle: {
      fontSize: 13,
      color: "#64748B",
      marginTop: 5,
    },

    headerIcon: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor:
        "#EEF2FF",
      justifyContent:
        "center",
      alignItems: "center",
      marginLeft: 10,
    },

    // ================= STATISTICS =================

    statistics: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 22,
    },

    statCard: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      padding: 13,
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        "#F1F5F9",
      elevation: 2,
    },

    statIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 7,
    },

    totalIcon: {
      backgroundColor:
        "#EEF2FF",
    },

    borrowingIcon: {
      backgroundColor:
        "#FFF7ED",
    },

    returnedIcon: {
      backgroundColor:
        "#ECFDF5",
    },

    statNumber: {
      fontSize: 20,
      fontWeight: "800",
      color: "#111827",
    },

    statLabel: {
      fontSize: 11,
      color: "#64748B",
      marginTop: 2,
    },

    // ================= FILTER =================

    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#111827",
      marginBottom: 10,
    },

    filterContainer: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 22,
    },

    filterButton: {
      flex: 1,
      minHeight: 58,
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
      justifyContent:
        "center",
      alignItems: "center",
      paddingHorizontal: 6,
    },

    filterButtonActive: {
      backgroundColor:
        "#4F46E5",
      borderColor:
        "#4F46E5",
    },

    filterIcon: {
      marginBottom: 2,
    },

    filterText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#64748B",
    },

    filterTextActive: {
      color: "#FFFFFF",
    },

    filterCount: {
      position: "absolute",
      top: 5,
      right: 5,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor:
        "#EEF2FF",
      justifyContent:
        "center",
      alignItems: "center",
    },

    filterCountActive: {
      backgroundColor:
        "rgba(255,255,255,0.2)",
    },

    filterCountText: {
      fontSize: 9,
      fontWeight: "800",
      color: "#4F46E5",
    },

    filterCountTextActive: {
      color: "#FFFFFF",
    },

    // ================= LIST =================

    listHeader: {
      marginBottom: 12,
    },

    listTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#111827",
    },

    listSubtitle: {
      fontSize: 12,
      color: "#94A3B8",
      marginTop: 3,
    },

    // ================= CARD =================

    card: {
      flexDirection: "row",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 12,
      marginBottom: 13,
      borderWidth: 1,
      borderColor:
        "#F1F5F9",
      elevation: 3,
    },

    bookImage: {
      width: 82,
      height: 110,
      borderRadius: 14,
      backgroundColor:
        "#F1F5F9",
    },

    bookImagePlaceholder: {
      width: 82,
      height: 110,
      borderRadius: 14,
      backgroundColor:
        "#EEF2FF",
      justifyContent:
        "center",
      alignItems: "center",
    },

    cardContent: {
      flex: 1,
      marginLeft: 13,
    },

    titleRow: {
      marginBottom: 5,
    },

    bookTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: "#111827",
      paddingRight: 5,
    },

    author: {
      fontSize: 12,
      color: "#64748B",
      marginBottom: 8,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },

    infoIcon: {
      width: 23,
      marginRight: 0,
    },

    infoText: {
      flex: 1,
      fontSize: 12,
      color: "#64748B",
    },

    overdueInfo: {
      color: "#DC2626",
      fontWeight: "700",
    },

    returnDateText: {
      flex: 1,
      fontSize: 12,
      color: "#059669",
      fontWeight: "600",
    },

    // ================= STATUS =================

    statusBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      marginTop: 6,
    },

    borrowingBadge: {
      backgroundColor:
        "#FFF7ED",
    },

    returnedBadge: {
      backgroundColor:
        "#ECFDF5",
    },

    overdueBadge: {
      backgroundColor:
        "#FEF2F2",
    },

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 5,
    },

    borrowingDot: {
      backgroundColor:
        "#F97316",
    },

    returnedDot: {
      backgroundColor:
        "#10B981",
    },

    overdueDot: {
      backgroundColor:
        "#EF4444",
    },

    statusText: {
      fontSize: 10,
      fontWeight: "800",
    },

    borrowingText: {
      color: "#EA580C",
    },

    returnedText: {
      color: "#059669",
    },

    overdueText: {
      color: "#DC2626",
    },

    // ================= EMPTY =================

    empty: {
      alignItems: "center",
      justifyContent:
        "center",
      paddingTop: 70,
      paddingHorizontal: 30,
    },

    emptyIconBox: {
      width: 80,
      height: 80,
      borderRadius: 25,
      backgroundColor:
        "#EEF2FF",
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 18,
    },

    emptyTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: "#111827",
      marginBottom: 6,
    },

    emptyText: {
      fontSize: 13,
      color: "#94A3B8",
      textAlign: "center",
    },
  });