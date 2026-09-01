  // import React, {
  //   useCallback,
  //   useState,
  // } from "react";

  // import {
  //   View,
  //   Text,
  //   FlatList,
  //   StyleSheet,
  //   TouchableOpacity,
  //   Alert,
  //   ActivityIndicator,
  // } from "react-native";

  // import { useFocusEffect } from "@react-navigation/native";

  // import {
  //   getBorrowingBooks,
  //   returnBook,
  // } from "../database/borrowRepository";

  // interface BorrowingBook {
  //   id: number;
  //   bookId: number;
  //   borrower: string;
  //   phone: string;
  //   borrowDate: string;
  //   dueDate: string;
  //   returnDate: string | null;
  //   title: string;
  //   image?: string;
  // }

  // export default function ReturnBookScreen({
  //   navigation,
  // }: any) {
  //   const [books, setBooks] =
  //     useState<BorrowingBook[]>([]);

  //   const [loading, setLoading] =
  //     useState(false);

  //   const [returningId, setReturningId] =
  //     useState<number | null>(null);

  //   // =====================================================
  //   // LOAD DANH SÁCH SÁCH ĐANG MƯỢN
  //   // =====================================================

  //   const loadData = useCallback(
  //     async () => {
  //       try {
  //         setLoading(true);

  //         const data =
  //           await getBorrowingBooks();

  //         setBooks(
  //           data as BorrowingBook[]
  //         );
  //       } catch (error) {
  //         console.log(
  //           "Lỗi tải sách đang mượn:",
  //           error
  //         );

  //         Alert.alert(
  //           "Lỗi",
  //           "Không thể tải danh sách sách đang mượn."
  //         );
  //       } finally {
  //         setLoading(false);
  //       }
  //     },
  //     []
  //   );

  //   useFocusEffect(
  //     useCallback(() => {
  //       loadData();
  //     }, [loadData])
  //   );

  //   // =====================================================
  //   // TRẢ SÁCH
  //   // =====================================================

  //   const handleReturn = async (
  //     item: BorrowingBook
  //   ) => {
  //     if (returningId !== null) {
  //       return;
  //     }

  //     Alert.alert(
  //       "Xác nhận trả sách",
  //       `Bạn có chắc muốn trả sách "${item.title}" không?`,
  //       [
  //         {
  //           text: "Hủy",
  //           style: "cancel",
  //         },
  //         {
  //           text: "Trả sách",
  //           onPress: async () => {
  //             try {
  //               setReturningId(item.id);

  //               await returnBook(
  //                 item.id,
  //                 item.bookId
  //               );

  //               setBooks((current) =>
  //                 current.filter(
  //                   (book) =>
  //                     book.id !== item.id
  //                 )
  //               );

  //               Alert.alert(
  //                 "Thành công",
  //                 `Đã trả sách "${item.title}" thành công.`
  //               );

  //               await loadData();
  //             } catch (error) {
  //               console.log(
  //                 "Lỗi trả sách:",
  //                 error
  //               );

  //               Alert.alert(
  //                 "Lỗi",
  //                 "Không thể trả sách. Vui lòng thử lại."
  //               );
  //             } finally {
  //               setReturningId(null);
  //             }
  //           },
  //         },
  //       ]
  //     );
  //   };

  //   // =====================================================
  //   // RENDER ITEM
  //   // =====================================================

  //   const renderItem = ({
  //     item,
  //   }: {
  //     item: BorrowingBook;
  //   }) => {
  //     const isReturning =
  //       returningId === item.id;

  //     return (
  //       <View style={styles.card}>
  //         <Text
  //           style={styles.title}
  //           numberOfLines={2}
  //         >
  //           {item.title}
  //         </Text>

  //         <Text style={styles.info}>
  //           Người mượn: {item.borrower}
  //         </Text>

  //         <Text style={styles.info}>
  //           SĐT: {item.phone || "Không có"}
  //         </Text>

  //         <Text style={styles.info}>
  //           Ngày mượn: {item.borrowDate}
  //         </Text>

  //         <Text
  //           style={[
  //             styles.info,
  //             styles.dueDate,
  //           ]}
  //         >
  //           Hạn trả: {item.dueDate}
  //         </Text>

  //         <TouchableOpacity
  //           activeOpacity={0.8}
  //           style={[
  //             styles.button,
  //             isReturning &&
  //               styles.buttonDisabled,
  //           ]}
  //           onPress={() =>
  //             handleReturn(item)
  //           }
  //           disabled={isReturning}
  //         >
  //           {isReturning ? (
  //             <View style={styles.buttonContent}>
  //               <ActivityIndicator
  //                 size="small"
  //                 color="#FFFFFF"
  //               />
  //               <Text
  //                 style={[
  //                   styles.buttonText,
  //                   styles.loadingText,
  //                 ]}
  //               >
  //                 Đang trả sách...
  //               </Text>
  //             </View>
  //           ) : (
  //             <Text style={styles.buttonText}>
  //               Trả sách
  //             </Text>
  //           )}
  //         </TouchableOpacity>
  //       </View>
  //     );
  //   };

  //   // =====================================================
  //   // UI
  //   // =====================================================

  //   return (
  //     <View style={styles.container}>
  //       <FlatList
  //         data={books}
  //         keyExtractor={(item) =>
  //           item.id.toString()
  //         }
  //         renderItem={renderItem}
  //         showsVerticalScrollIndicator={false}
  //         refreshing={loading}
  //         onRefresh={loadData}
  //         ListEmptyComponent={
  //           loading ? (
  //             <View style={styles.loadingContainer}>
  //               <ActivityIndicator
  //                 size="large"
  //                 color="#2196F3"
  //               />
  //               <Text style={styles.loadingLabel}>
  //                 Đang tải danh sách sách...
  //               </Text>
  //             </View>
  //           ) : (
  //             <View
  //               style={styles.emptyContainer}
  //             >
  //               <Text style={styles.empty}>
  //                 Không có sách đang mượn
  //               </Text>
  //             </View>
  //           )
  //         }
  //         contentContainerStyle={
  //           books.length === 0
  //             ? styles.emptyList
  //             : styles.list
  //         }
  //       />
  //     </View>
  //   );
  // }

  // // =====================================================
  // // STYLE
  // // =====================================================

  // const styles =
  //   StyleSheet.create({
  //     container: {
  //       flex: 1,
  //       backgroundColor: "#F8FAFC",
  //       paddingHorizontal: 12,
  //       paddingTop: 12,
  //     },

  //     list: {
  //       paddingBottom: 30,
  //     },

  //     emptyList: {
  //       flexGrow: 1,
  //     },

  //     loadingContainer: {
  //       flex: 1,
  //       justifyContent: "center",
  //       alignItems: "center",
  //       paddingTop: 80,
  //     },

  //     loadingLabel: {
  //       marginTop: 12,
  //       fontSize: 15,
  //       color: "#64748B",
  //     },

  //     emptyContainer: {
  //       flex: 1,
  //       justifyContent: "center",
  //       alignItems: "center",
  //       paddingTop: 40,
  //     },

  //     card: {
  //       backgroundColor: "#FFFFFF",
  //       padding: 16,
  //       marginBottom: 12,
  //       borderRadius: 16,
  //       borderWidth: 1,
  //       borderColor: "#E5E7EB",

  //       shadowColor: "#000",
  //       shadowOpacity: 0.05,
  //       shadowRadius: 6,
  //       shadowOffset: {
  //         width: 0,
  //         height: 2,
  //       },
  //       elevation: 2,
  //     },

  //     title: {
  //       fontSize: 18,
  //       fontWeight: "700",
  //       color: "#111827",
  //       marginBottom: 10,
  //     },

  //     info: {
  //       fontSize: 14,
  //       color: "#64748B",
  //       marginBottom: 6,
  //     },

  //     dueDate: {
  //       color: "#DC2626",
  //       fontWeight: "600",
  //     },

  //     button: {
  //       marginTop: 10,
  //       backgroundColor: "#2196F3",
  //       paddingVertical: 13,
  //       borderRadius: 10,
  //       minHeight: 48,
  //       justifyContent: "center",
  //       alignItems: "center",
  //     },

  //     buttonDisabled: {
  //       opacity: 0.7,
  //     },

  //     buttonContent: {
  //       flexDirection: "row",
  //       alignItems: "center",
  //       justifyContent: "center",
  //       gap: 8,
  //     },

  //     buttonText: {
  //       color: "#FFFFFF",
  //       textAlign: "center",
  //       fontWeight: "700",
  //       fontSize: 15,
  //     },

  //     loadingText: {
  //       marginLeft: 2,
  //     },

  //     empty: {
  //       textAlign: "center",
  //       fontSize: 16,
  //       color: "#64748B",
  //     },
  //   });
  import React, {
    useCallback,
    useState,
  } from "react";

  import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform,
  } from "react-native";

  import { useFocusEffect } from "@react-navigation/native";

  import {
    getBorrowingBooks,
    returnBook,
  } from "../database/borrowRepository";

  interface BorrowingBook {
    id: number;
    bookId: number;
    borrower: string;
    phone: string;
    borrowDate: string;
    dueDate: string;
    returnDate: string | null;
    title: string;
    image?: string;
  }

  export default function ReturnBookScreen({
    navigation,
  }: any) {
    const [books, setBooks] =
      useState<BorrowingBook[]>([]);

    const [loading, setLoading] =
      useState(false);

    const [returningId, setReturningId] =
      useState<number | null>(null);

    // =====================================================
    // LOAD DANH SÁCH SÁCH ĐANG MƯỢN
    // =====================================================

    const loadData = useCallback(
      async () => {
        try {
          setLoading(true);

          const data =
            await getBorrowingBooks();

          setBooks(
            data as BorrowingBook[]
          );
        } catch (error) {
          console.log(
            "Lỗi tải sách đang mượn:",
            error
          );

          Alert.alert(
            "Lỗi",
            "Không thể tải danh sách sách đang mượn."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

    useFocusEffect(
      useCallback(() => {
        loadData();
      }, [loadData])
    );

    // =====================================================
    // TRẢ SÁCH
    // =====================================================

    const handleReturn = async (
      item: BorrowingBook
    ) => {
      if (returningId !== null) {
        return;
      }

    const performReturn = async () => {
      try {
        setReturningId(item.id);

        await returnBook(
          item.id,
          item.bookId
        );

        setBooks((current) =>
          current.filter(
            (book) => book.id !== item.id
          )
        );

        const message =
          `Đã trả sách "${item.title}" thành công.`;

        if (Platform.OS === "web") {
          window.alert(message);
        } else {
          Alert.alert(
            "Trả sách thành công",
            message
          );
        }

        await loadData();
      } catch (error) {
        console.log("Lỗi trả sách:", error);

        const message =
          "Không thể trả sách. Vui lòng thử lại.";

        if (Platform.OS === "web") {
          window.alert(message);
        } else {
          Alert.alert("Lỗi", message);
        }
      } finally {
        setReturningId(null);
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Bạn có chắc muốn trả sách "${item.title}" không?`
      );

      if (confirmed) {
        void performReturn();
      }

      return;
    }

    Alert.alert(
      "Xác nhận trả sách",
      `Bạn có chắc muốn trả sách "${item.title}" không?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Trả sách",
          onPress: performReturn,
        },
      ]
    );
    };

    // =====================================================
    // RENDER ITEM
    // =====================================================

    const renderItem = ({
      item,
    }: {
      item: BorrowingBook;
    }) => {
      const isReturning =
        returningId === item.id;

      return (
        <View style={styles.card}>
          <Text
            style={styles.title}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <Text style={styles.info}>
            Người mượn: {item.borrower}
          </Text>

          <Text style={styles.info}>
            SĐT: {item.phone || "Không có"}
          </Text>

          <Text style={styles.info}>
            Ngày mượn: {item.borrowDate}
          </Text>

          <Text
            style={[
              styles.info,
              styles.dueDate,
            ]}
          >
            Hạn trả: {item.dueDate}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.button,
              isReturning &&
                styles.buttonDisabled,
            ]}
            onPress={() =>
              handleReturn(item)
            }
            disabled={isReturning}
          >
            {isReturning ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
                <Text
                  style={[
                    styles.buttonText,
                    styles.loadingText,
                  ]}
                >
                  Đang trả sách...
                </Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>
                Trả sách
              </Text>
            )}
          </TouchableOpacity>
        </View>
      );
    };

    // =====================================================
    // UI
    // =====================================================

    return (
      <View style={styles.container}>
        <FlatList
          data={books}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadData}
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color="#2196F3"
                />
                <Text style={styles.loadingLabel}>
                  Đang tải danh sách sách...
                </Text>
              </View>
            ) : (
              <View
                style={styles.emptyContainer}
              >
                <Text style={styles.empty}>
                  Không có sách đang mượn
                </Text>
              </View>
            )
          }
          contentContainerStyle={
            books.length === 0
              ? styles.emptyList
              : styles.list
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
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 12,
        paddingTop: 12,
      },

      list: {
        paddingBottom: 30,
      },

      emptyList: {
        flexGrow: 1,
      },

      loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 80,
      },

      loadingLabel: {
        marginTop: 12,
        fontSize: 15,
        color: "#64748B",
      },

      emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 40,
      },

      card: {
        backgroundColor: "#FFFFFF",
        padding: 16,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        elevation: 2,
      },

      title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 10,
      },

      info: {
        fontSize: 14,
        color: "#64748B",
        marginBottom: 6,
      },

      dueDate: {
        color: "#DC2626",
        fontWeight: "600",
      },

      button: {
        marginTop: 10,
        backgroundColor: "#2196F3",
        paddingVertical: 13,
        borderRadius: 10,
        minHeight: 48,
        justifyContent: "center",
        alignItems: "center",
      },

      buttonDisabled: {
        opacity: 0.7,
      },

      buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      },

      buttonText: {
        color: "#FFFFFF",
        textAlign: "center",
        fontWeight: "700",
        fontSize: 15,
      },

      loadingText: {
        marginLeft: 2,
      },

      empty: {
        textAlign: "center",
        fontSize: 16,
        color: "#64748B",
      },
    });
