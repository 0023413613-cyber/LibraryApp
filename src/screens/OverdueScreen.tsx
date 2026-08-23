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
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

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
}

interface OverdueRecord extends BorrowRecord {
  overdueDays: number;
}

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
  const today = getDateOnly(new Date());

  const due = getDateOnly(
    new Date(`${dueDate}T00:00:00`)
  );

  const difference =
    today.getTime() - due.getTime();

  return Math.floor(
    difference /
      (1000 * 60 * 60 * 24)
  );
}

export default function OverdueScreen() {
  const [overdueList, setOverdueList] =
    useState<OverdueRecord[]>([]);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadOverdueList =
    useCallback(async () => {
      try {
        const data =
          await getBorrowHistory();

        const records =
          data as BorrowRecord[];

        const overdue: OverdueRecord[] =
          records
            .filter((item) => {
              const notReturned =
                item.returnDate === null ||
                item.returnDate === undefined ||
                item.returnDate === "";

              const days =
                calculateOverdueDays(
                  item.dueDate
                );

              return (
                notReturned &&
                days > 0
              );
            })
            .map((item) => ({
              ...item,
              overdueDays:
                calculateOverdueDays(
                  item.dueDate
                ),
            }));

        setOverdueList(overdue);
      } catch (error) {
        console.log(
          "Lỗi tải sách quá hạn:",
          error
        );
      }
    }, []);

  useFocusEffect(
    useCallback(() => {
      loadOverdueList();
    }, [loadOverdueList])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOverdueList();
    setRefreshing(false);
  };

  const totalOverdueDays =
    overdueList.reduce(
      (total, item) =>
        total + item.overdueDays,
      0
    );

  const renderItem = ({
    item,
  }: {
    item: OverdueRecord;
  }) => {
    return (
      <View style={styles.card}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.image}
          />
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageText}>
              ⚠️
            </Text>
          </View>
        )}

        <View style={styles.info}>
          <Text
            style={styles.title}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.icon}>👤</Text>

            <Text style={styles.text}>
              {item.borrower}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.icon}>📞</Text>

            <Text style={styles.text}>
              {item.phone || "Không có"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.icon}>📅</Text>

            <Text style={styles.text}>
              Mượn: {item.borrowDate}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.icon}>⏰</Text>

            <Text style={styles.dueDate}>
              Hạn trả: {item.dueDate}
            </Text>
          </View>

          <View style={styles.overdueBadge}>
            <Text style={styles.overdueIcon}>
              !
            </Text>

            <Text style={styles.overdueText}>
              Quá hạn {item.overdueDays} ngày
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.smallTitle}>
            CẢNH BÁO
          </Text>

          <Text style={styles.headerTitle}>
            Sách quá hạn
          </Text>

          <Text style={styles.subtitle}>
            Những sách cần được trả lại
          </Text>
        </View>

        <View style={styles.warningIcon}>
          <Text style={styles.warningIconText}>
            ⚠️
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconRed}>
            <Text>⚠️</Text>
          </View>

          <Text style={styles.statNumber}>
            {overdueList.length}
          </Text>

          <Text style={styles.statLabel}>
            Sách quá hạn
          </Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconOrange}>
            <Text>⏰</Text>
          </View>

          <Text style={styles.statNumber}>
            {totalOverdueDays}
          </Text>

          <Text style={styles.statLabel}>
            Tổng ngày trễ
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Danh sách quá hạn
        </Text>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {overdueList.length}
          </Text>
        </View>
      </View>

      <FlatList
        data={overdueList}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={
          overdueList.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconBox}>
              <Text style={styles.emptyIcon}>
                🎉
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              Tuyệt vời!
            </Text>

            <Text style={styles.emptyText}>
              Hiện tại không có sách nào quá hạn.
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

  header: {
    paddingTop: 20,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },

  warningIconText: {
    fontSize: 29,
  },

  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,

    borderWidth: 1,
    borderColor: "#F1F5F9",

    shadowColor: "#1E293B",
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
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 9,
  },

  statIconOrange: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
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
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    marginLeft: 8,
  },

  countText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "800",
  },

  list: {
    paddingBottom: 30,
  },

  emptyContainer: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    marginBottom: 13,
    flexDirection: "row",

    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",

    shadowColor: "#1E293B",
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
    backgroundColor: "#F1F5F9",
  },

  noImage: {
    width: 82,
    height: 110,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },

  noImageText: {
    fontSize: 30,
  },

  info: {
    flex: 1,
    marginLeft: 13,
  },

  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 9,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  icon: {
    width: 23,
    fontSize: 12,
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
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 4,
  },

  overdueIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "800",
    marginRight: 6,
  },

  overdueText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "700",
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyIconBox: {
    width: 85,
    height: 85,
    borderRadius: 27,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  emptyIcon: {
    fontSize: 38,
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