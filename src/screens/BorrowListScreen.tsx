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
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  author?: string;
  image: string;
}

export default function BorrowListScreen() {
  const insets = useSafeAreaInsets();
  // =====================================================
  // STATE
  // =====================================================

  const [borrowList, setBorrowList] = useState<
    BorrowRecord[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [refreshing, setRefreshing] =
    useState(false);

  // =====================================================
  // LOAD DATA
  // =====================================================

  const load = useCallback(
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

        const currentBorrowing =
          (
            data as BorrowRecord[]
          ).filter(
            (item) =>
              !item.returnDate
          );

        setBorrowList(
          currentBorrowing
        );
      } catch (e) {
        console.log(
          "Lỗi tải sách đang mượn:",
          e
        );

        setError(
          "Không thể tải danh sách sách đang mượn."
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
      load(true);
    }, [load])
  );

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh =
    async () => {
      try {
        setRefreshing(true);
        await load(false);
      } finally {
        setRefreshing(false);
      }
    };

  // =====================================================
  // RETRY
  // =====================================================

  const handleRetry =
    async () => {
      await load(true);
    };

  // =====================================================
  // THỐNG KÊ
  // =====================================================

  const toComparableDate = (
    value?: string | null
  ) => {
    if (!value) {
      return null;
    }

    const normalized = value.trim();

    if (!normalized) {
      return null;
    }

    const match = normalized.match(
      /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/
    );

    if (match) {
      const [, year, month, day] = match;
      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );
    }

    const dmy = normalized.match(
      /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/
    );

    if (dmy) {
      const [, day, month, year] = dmy;
      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );
    }

    return new Date(normalized);
  };

  const overdueCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return borrowList.filter((item) => {
      const dueDate = toComparableDate(item.dueDate);
      if (!dueDate) {
        return false;
      }

      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;
  }, [borrowList]);

  const hasOverdue =
    overdueCount > 0;

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    date?: string
  ) => {
    if (!date) {
      return "-";
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
  // CHECK OVERDUE
  // =====================================================

  const isOverdue = (
    date: string
  ) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = toComparableDate(date);

    if (!dueDate) {
      return false;
    }

    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <View
        style={[
          styles.stateContainer,
          { paddingTop: insets.top },
        ]}
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
          Đang lấy danh sách sách đang mượn...
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
        style={[
          styles.stateContainer,
          { paddingTop: insets.top },
        ]}
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
    item: BorrowRecord;
  }) => {
    const overdue =
      isOverdue(
        item.dueDate
      );

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
              styles.image
            }
          />
        ) : (
          <View
            style={
              styles.noImage
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
          style={styles.info}
        >
          <View
            style={
              styles.titleRow
            }
          >
            <Text
              style={styles.title}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            <View
              style={[
                styles.badge,
                overdue
                  ? styles.overdueBadge
                  : styles.borrowBadge,
              ]}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      overdue
                        ? "#DC2626"
                        : "#EA580C",
                  },
                ]}
              />

              <Text
                style={[
                  styles.badgeText,
                  {
                    color:
                      overdue
                        ? "#DC2626"
                        : "#EA580C",
                  },
                ]}
              >
                {overdue
                  ? "Quá hạn"
                  : "Đang mượn"}
              </Text>
            </View>
          </View>

          {!!item.author && (
            <Text
              style={
                styles.author
              }
              numberOfLines={1}
            >
              {item.author}
            </Text>
          )}

          <View
            style={
              styles.infoRow
            }
          >
            <Ionicons
              name="person-outline"
              size={15}
              color="#64748B"
            />

            <Text
              style={styles.text}
            >
              {item.borrower}
            </Text>
          </View>

          <View
            style={
              styles.infoRow
            }
          >
            <Ionicons
              name="call-outline"
              size={15}
              color="#64748B"
            />

            <Text
              style={styles.text}
            >
              {item.phone ||
                "Không có số điện thoại"}
            </Text>
          </View>

          <View
            style={
              styles.infoRow
            }
          >
            <Ionicons
              name="calendar-outline"
              size={15}
              color="#64748B"
            />

            <Text
              style={styles.text}
            >
              Mượn:{" "}
              {formatDate(
                item.borrowDate
              )}
            </Text>
          </View>

          <View
            style={
              styles.infoRow
            }
          >
            <Ionicons
              name="time-outline"
              size={15}
              color={
                overdue
                  ? "#DC2626"
                  : "#64748B"
              }
            />

            <Text
              style={[
                styles.text,
                overdue &&
                  styles.overdueText,
              ]}
            >
              Hạn trả:{" "}
              {formatDate(
                item.dueDate
              )}
            </Text>
          </View>

          {overdue && (
            <View style={styles.returnReminder}>
              <Ionicons
                name="warning-outline"
                size={15}
                color="#DC2626"
              />

              <Text style={styles.returnReminderText}>
                Kêu trả sách
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
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <FlatList
        data={borrowList}
        keyExtractor={(item) =>
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
              handleRefresh
            }
          />
        }
        contentContainerStyle={
          borrowList.length
            ? styles.list
            : styles.emptyList
        }
        ListHeaderComponent={
          <>
            {/* HEADER */}

            <View
              style={styles.header}
            >
              <View
                style={
                  styles.headerText
                }
              >
                <Text
                  style={
                    styles.eyebrow
                  }
                >
                  THƯ VIỆN CÁ NHÂN
                </Text>

                <Text
                  style={
                    styles.headerTitle
                  }
                >
                  Sách đang mượn
                </Text>

                <Text
                  style={
                    styles.subTitle
                  }
                >
                  Theo dõi những cuốn sách bạn chưa trả
                </Text>
              </View>

              <View
                style={
                  styles.headerIcon
                }
              >
                <Ionicons
                  name="library-outline"
                  size={31}
                  color="#5146E5"
                />
              </View>
            </View>

            {/* STATS */}

            {hasOverdue && (
              <View style={styles.warningBanner}>
                <Ionicons
                  name="alert-circle"
                  size={18}
                  color="#DC2626"
                />

                <Text style={styles.warningText}>
                  Kêu trả sách: {overdueCount} cuốn quá hạn
                </Text>
              </View>
            )}

            <View
              style={styles.stats}
            >
              <View
                style={styles.stat}
              >
                <View
                  style={[
                    styles.statIcon,
                    {
                      backgroundColor:
                        "#EEF2FF",
                    },
                  ]}
                >
                  <Ionicons
                    name="book-outline"
                    size={20}
                    color="#5146E5"
                  />
                </View>

                <Text
                  style={
                    styles.number
                  }
                >
                  {borrowList.length}
                </Text>

                <Text
                  style={
                    styles.label
                  }
                >
                  Đang mượn
                </Text>
              </View>

              <View
                style={styles.stat}
              >
                <View
                  style={[
                    styles.statIcon,
                    {
                      backgroundColor:
                        "#FEF2F2",
                    },
                  ]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color="#DC2626"
                  />
                </View>

                <Text
                  style={[
                    styles.number,
                    {
                      color:
                        "#DC2626",
                    },
                  ]}
                >
                  {overdueCount}
                </Text>

                <Text
                  style={
                    styles.label
                  }
                >
                  Quá hạn
                </Text>
              </View>

              <View
                style={styles.stat}
              >
                <View
                  style={[
                    styles.statIcon,
                    {
                      backgroundColor:
                        "#ECFDF5",
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#059669"
                  />
                </View>

                <Text
                  style={[
                    styles.number,
                    {
                      color:
                        "#059669",
                    },
                  ]}
                >
                  {Math.max(
                    0,
                    borrowList.length -
                      overdueCount
                  )}
                </Text>

                <Text
                  style={
                    styles.label
                  }
                >
                  Trong hạn
                </Text>
              </View>
            </View>

            <View
              style={
                styles.sectionRow
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Danh sách mượn
              </Text>

              <Text
                style={
                  styles.result
                }
              >
                {borrowList.length} kết quả
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View
            style={styles.empty}
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <Ionicons
                name="book-outline"
                size={42}
                color="#5146E5"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Không có sách đang mượn
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Hiện tại không có sách nào đang được mượn.
            </Text>
          </View>
        }
      />
    </View>
  );
}

// =====================================================
// STYLES
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

    warningBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FEF2F2",
      borderColor: "#FECACA",
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginTop: 14,
      marginBottom: 10,
      gap: 8,
    },

    warningText: {
      color: "#B91C1C",
      fontSize: 13,
      fontWeight: "700",
      flexShrink: 1,
    },

    header: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      paddingTop: 18,
      paddingBottom: 16,
    },

    headerText: {
      flex: 1,
    },

    eyebrow: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.8,
      color: "#5146E5",
    },

    headerTitle: {
      fontSize: 29,
      fontWeight: "800",
      color: "#111827",
      marginTop: 3,
    },

    subTitle: {
      fontSize: 13,
      color: "#64748B",
      marginTop: 5,
    },

    headerIcon: {
      width: 60,
      height: 60,
      borderRadius: 20,
      backgroundColor:
        "#EEF2FF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    // ================= STATS =================

    stats: {
      flexDirection: "row",
      gap: 9,
      marginBottom: 20,
    },

    stat: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 17,
      padding: 11,
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        "#EEF2F7",
    },

    statIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 5,
    },

    number: {
      fontSize: 20,
      fontWeight: "800",
      color: "#111827",
    },

    label: {
      fontSize: 10,
      color: "#64748B",
      marginTop: 2,
    },

    // ================= LIST =================

    sectionRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 11,
    },

    sectionTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: "#111827",
    },

    result: {
      fontSize: 11,
      color: "#94A3B8",
    },

    // ================= CARD =================

    card: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 12,
      marginBottom: 12,
      flexDirection: "row",
      borderWidth: 1,
      borderColor:
        "#EEF2F7",
      elevation: 2,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 7,
      shadowOffset: {
        width: 0,
        height: 3,
      },
    },

    image: {
      width: 82,
      height: 112,
      borderRadius: 14,
      backgroundColor:
        "#EEF2F7",
    },

    noImage: {
      width: 82,
      height: 112,
      borderRadius: 14,
      backgroundColor:
        "#EEF2FF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    info: {
      flex: 1,
      marginLeft: 12,
    },

    titleRow: {
      marginBottom: 3,
    },

    title: {
      fontSize: 16,
      fontWeight: "800",
      color: "#111827",
      paddingRight: 2,
    },

    author: {
      fontSize: 11,
      color: "#64748B",
      marginBottom: 7,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
      gap: 6,
    },

    returnReminder: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 8,
      backgroundColor: "#FEF2F2",
      borderRadius: 10,
      paddingVertical: 6,
      paddingHorizontal: 10,
      alignSelf: "flex-start",
    },

    returnReminderText: {
      color: "#DC2626",
      fontSize: 12,
      fontWeight: "700",
    },

    text: {
      flex: 1,
      fontSize: 11,
      color: "#64748B",
    },

    overdueText: {
      color: "#DC2626",
      fontWeight: "800",
    },

    badge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 9,
      marginTop: 5,
    },

    borrowBadge: {
      backgroundColor:
        "#FFF7ED",
    },

    overdueBadge: {
      backgroundColor:
        "#FEF2F2",
    },

    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 5,
    },

    badgeText: {
      fontSize: 9,
      fontWeight: "800",
    },

    // ================= EMPTY =================

    empty: {
      alignItems: "center",
      justifyContent:
        "center",
      paddingTop: 65,
      paddingHorizontal: 25,
    },

    emptyIcon: {
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

    emptyTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: "#111827",
      textAlign: "center",
    },

    emptyText: {
      fontSize: 13,
      color: "#94A3B8",
      textAlign: "center",
      marginTop: 7,
      lineHeight: 20,
    },
  });