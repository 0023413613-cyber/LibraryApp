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
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
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
  image: string;
  author?: string;
}

interface OverdueRecord extends BorrowRecord {
  overdueDays: number;
}

// =====================================================
// DATE HELPER
// =====================================================

function getDateOnly(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function calculateOverdueDays(
  dueDate: string
) {
  const today = getDateOnly(
    new Date()
  );

  const due = getDateOnly(
    new Date(`${dueDate}T00:00:00`)
  );

  const difference =
    today.getTime() -
    due.getTime();

  return Math.floor(
    difference /
    (1000 * 60 * 60 * 24)
  );
}

function isOverdue(
  item: BorrowRecord
) {
  // Đã trả thì KHÔNG BAO GIỜ quá hạn
  if (
    item.returnDate !== null &&
    item.returnDate !== undefined &&
    item.returnDate !== ""
  ) {
    return false;
  }

  // Chưa trả + dueDate < hôm nay
  return (
    calculateOverdueDays(
      item.dueDate
    ) > 0
  );
}

function formatDate(
  date?: string | null
) {
  if (!date) {
    return "Chưa có";
  }

  const parts =
    date.split("-");

  if (
    parts.length === 3
  ) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return date;
}

// =====================================================
// SCREEN
// =====================================================

export default function OverdueScreen() {
  const insets =
    useSafeAreaInsets();

  const [
    overdueList,
    setOverdueList,
  ] = useState<
    OverdueRecord[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadOverdueList =
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

          const records =
            data as BorrowRecord[];

          const overdue =
            records
              .filter(
                (item) =>
                  isOverdue(item)
              )
              .map((item) => ({
                ...item,
                overdueDays:
                  calculateOverdueDays(
                    item.dueDate
                  ),
              }));

          setOverdueList(
            overdue
          );
        } catch (err) {
          console.error(
            "Lỗi tải sách quá hạn:",
            err
          );

          setError(
            "Không thể tải danh sách sách quá hạn."
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
  // LOAD KHI MỞ SCREEN
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      loadOverdueList(true);
    }, [loadOverdueList])
  );

  // =====================================================
  // REFRESH
  // =====================================================

  const onRefresh =
    async () => {
      try {
        setRefreshing(true);
        await loadOverdueList(false);
      } finally {
        setRefreshing(false);
      }
    };

  // =====================================================
  // RETRY
  // =====================================================

  const handleRetry =
    async () => {
      await loadOverdueList(
        true
      );
    };

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalOverdueDays =
    overdueList.reduce(
      (
        total,
        item
      ) =>
        total +
        item.overdueDays,
      0
    );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <View
        style={[
          styles.stateContainer,
          {
            paddingTop:
              insets.top,
          },
        ]}
      >
        <View
          style={
            styles.stateIconBox
          }
        >
          <ActivityIndicator
            size="large"
            color="#EF4444"
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
          Đang kiểm tra sách quá hạn...
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
          {
            paddingTop:
              insets.top,
          },
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
            size={44}
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
    item: OverdueRecord;
  }) => {
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
              name="warning-outline"
              size={38}
              color="#EF4444"
            />
          </View>
        )}

        <View
          style={styles.info}
        >
          <Text
            style={styles.title}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {item.author && (
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
              size={16}
              color="#64748B"
              style={
                styles.icon
              }
            />

            <Text
              style={
                styles.text
              }
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
              size={16}
              color="#64748B"
              style={
                styles.icon
              }
            />

            <Text
              style={
                styles.text
              }
            >
              {item.phone ||
                "Không có"}
            </Text>
          </View>

          <View
            style={
              styles.infoRow
            }
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#64748B"
              style={
                styles.icon
              }
            />

            <Text
              style={
                styles.text
              }
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
              size={16}
              color="#DC2626"
              style={
                styles.icon
              }
            />

            <Text
              style={
                styles.dueDate
              }
            >
              Hạn trả:{" "}
              {formatDate(
                item.dueDate
              )}
            </Text>
          </View>

          <View
            style={
              styles.overdueBadge
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={15}
              color="#DC2626"
            />

            <Text
              style={
                styles.overdueText
              }
            >
              Quá hạn{" "}
              {item.overdueDays} ngày
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // =====================================================
  // SUCCESS / EMPTY
  // =====================================================

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop:
            insets.top,
        },
      ]}
    >
      {/* HEADER */}

      <View
        style={styles.header}
      >
        <View
          style={styles.headerText}
        >
          <Text
            style={
              styles.smallTitle
            }
          >
            CẢNH BÁO
          </Text>

          <Text
            style={
              styles.headerTitle
            }
          >
            Sách quá hạn
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Những sách cần được trả lại
          </Text>
        </View>

        <View
          style={
            styles.warningIcon
          }
        >
          <Ionicons
            name="warning-outline"
            size={31}
            color="#EF4444"
          />
        </View>
      </View>

      {/* STATISTICS */}

      <View
        style={
          styles.statsContainer
        }
      >
        <View
          style={
            styles.statCard
          }
        >
          <View
            style={
              styles.statIconRed
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color="#EF4444"
            />
          </View>

          <Text
            style={
              styles.statNumber
            }
          >
            {overdueList.length}
          </Text>

          <Text
            style={
              styles.statLabel
            }
          >
            Sách quá hạn
          </Text>
        </View>

        <View
          style={
            styles.statCard
          }
        >
          <View
            style={
              styles.statIconOrange
            }
          >
            <Ionicons
              name="time-outline"
              size={22}
              color="#F97316"
            />
          </View>

          <Text
            style={
              styles.statNumber
            }
          >
            {totalOverdueDays}
          </Text>

          <Text
            style={
              styles.statLabel
            }
          >
            Tổng ngày trễ
          </Text>
        </View>
      </View>

      {/* SECTION */}

      <View
        style={
          styles.sectionHeader
        }
      >
        <Text
          style={
            styles.sectionTitle
          }
        >
          Danh sách quá hạn
        </Text>

        <View
          style={
            styles.countBadge
          }
        >
          <Text
            style={
              styles.countText
            }
          >
            {overdueList.length}
          </Text>
        </View>
      </View>

      {/* LIST */}

      <FlatList
        data={overdueList}
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
          overdueList.length ===
            0
            ? styles.emptyContainer
            : styles.list
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
                name="checkmark-circle-outline"
                size={45}
                color="#059669"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Tuyệt vời!
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Hiện tại không có sách nào quá hạn.
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
        "#FEF2F2",
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
        "#EF4444",
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
      paddingTop: 20,
      paddingBottom: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    headerText: {
      flex: 1,
    },

    smallTitle: {
      fontSize: 12,
      fontWeight: "800",
      color: "#EF4444",
      letterSpacing: 1.5,
    },

    headerTitle: {
      fontSize: 27,
      fontWeight: "800",
      color: "#111827",
      marginTop: 4,
    },

    subtitle: {
      fontSize: 13,
      color: "#64748B",
      marginTop: 5,
    },

    warningIcon: {
      width: 58,
      height: 58,
      borderRadius: 20,
      backgroundColor:
        "#FEF2F2",
      justifyContent:
        "center",
      alignItems: "center",
      marginLeft: 10,
    },

    // ================= STATISTICS =================

    statsContainer: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
    },

    statCard: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor:
        "#F1F5F9",
      shadowColor:
        "#1E293B",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },

    statIconRed: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        "#FEF2F2",
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 9,
    },

    statIconOrange: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        "#FFF7ED",
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 9,
    },

    statNumber: {
      fontSize: 25,
      fontWeight: "800",
      color: "#111827",
    },

    statLabel: {
      fontSize: 12,
      color: "#64748B",
      marginTop: 2,
    },

    // ================= SECTION =================

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: "#111827",
    },

    countBadge: {
      minWidth: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor:
        "#FEF2F2",
      justifyContent:
        "center",
      alignItems: "center",
      paddingHorizontal: 8,
      marginLeft: 8,
    },

    countText: {
      color: "#DC2626",
      fontSize: 13,
      fontWeight: "800",
    },

    // ================= LIST =================

    list: {
      paddingBottom: 30,
    },

    emptyContainer: {
      flexGrow: 1,
    },

    // ================= CARD =================

    card: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 12,
      marginBottom: 13,
      flexDirection: "row",
      borderLeftWidth: 4,
      borderLeftColor:
        "#EF4444",
      shadowColor:
        "#1E293B",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 3,
    },

    image: {
      width: 82,
      height: 110,
      borderRadius: 14,
      backgroundColor:
        "#F1F5F9",
    },

    noImage: {
      width: 82,
      height: 110,
      borderRadius: 14,
      backgroundColor:
        "#FEF2F2",
      justifyContent:
        "center",
      alignItems: "center",
    },

    info: {
      flex: 1,
      marginLeft: 13,
    },

    title: {
      fontSize: 16,
      fontWeight: "800",
      color: "#111827",
      marginBottom: 4,
    },

    author: {
      fontSize: 12,
      color: "#64748B",
      marginBottom: 7,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },

    icon: {
      width: 23,
      marginRight: 0,
    },

    text: {
      flex: 1,
      fontSize: 12,
      color: "#64748B",
    },

    dueDate: {
      flex: 1,
      fontSize: 12,
      color: "#DC2626",
      fontWeight: "700",
    },

    overdueBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#FEF2F2",
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 12,
      marginTop: 4,
      gap: 5,
    },

    overdueText: {
      color: "#DC2626",
      fontSize: 11,
      fontWeight: "700",
    },

    // ================= EMPTY =================

    empty: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      paddingHorizontal: 30,
    },

    emptyIconBox: {
      width: 85,
      height: 85,
      borderRadius: 27,
      backgroundColor:
        "#ECFDF5",
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 18,
    },

    emptyTitle: {
      fontSize: 21,
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