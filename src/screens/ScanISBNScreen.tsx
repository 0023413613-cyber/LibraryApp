import React, { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

export default function ScanISBNScreen({
  navigation,
}: any) {
  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const isValidISBN13 = (isbn: string) => {
    const value = isbn.replace(/[-\s]/g, "");

    if (!/^\d{13}$/.test(value)) {
      return false;
    }

    if (
      !value.startsWith("978") &&
      !value.startsWith("979")
    ) {
      return false;
    }

    let sum = 0;

    for (let i = 0; i < 12; i++) {
      const digit = Number(value[i]);

      sum +=
        i % 2 === 0
          ? digit
          : digit * 3;
    }

    const checkDigit =
      (10 - (sum % 10)) % 10;

    return (
      checkDigit ===
      Number(value[12])
    );
  };

  const fetchBookByISBN = async (
  isbn: string
) => {
  try {
    setLoading(true);

    const cleanISBN =
      isbn.replace(/[-\s]/g, "");

    console.log(
      "ISBN hợp lệ:",
      cleanISBN
    );

    // ==========================================
    // BƯỚC 1: TÌM THÔNG TIN SÁCH THEO ISBN
    // ==========================================

    const response = await fetch(
      `https://openlibrary.org/search.json?isbn=${cleanISBN}&limit=1`
    );

    if (!response.ok) {
      throw new Error(
        "Không thể kết nối đến API sách."
      );
    }

    const data =
      await response.json();

    if (
      !data.docs ||
      data.docs.length === 0
    ) {
      Alert.alert(
        "Không tìm thấy sách",
        `Không tìm thấy thông tin cho ISBN ${cleanISBN}.\n\nBạn có thể nhập thông tin sách thủ công.`,
        [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
            },
          },
        ]
      );

      return;
    }

    const book = data.docs[0];

    // ==========================================
    // BƯỚC 2: LẤY TÊN SÁCH
    // ==========================================

    const title =
      book.title ?? "";

    // ==========================================
    // BƯỚC 3: LẤY TÁC GIẢ
    // ==========================================

    const author =
      book.author_name?.[0] ?? "";

    // ==========================================
    // BƯỚC 4: LẤY THỂ LOẠI
    // ==========================================

    let category = "";

    // Thử lấy subject ngay từ kết quả tìm kiếm
    if (
      book.subject &&
      Array.isArray(book.subject) &&
      book.subject.length > 0
    ) {
      category = book.subject[0];

      console.log(
        "Thể loại lấy từ Search API:",
        category
      );
    }

    // ==========================================
    // BƯỚC 5: NẾU CHƯA CÓ THỂ LOẠI
    // → GỌI API WORKS
    // ==========================================

    if (
      !category &&
      book.key
    ) {
      try {
        const workResponse =
          await fetch(
            `https://openlibrary.org${book.key}.json`
          );

        if (workResponse.ok) {
          const workData =
            await workResponse.json();

          if (
            workData.subjects &&
            Array.isArray(
              workData.subjects
            ) &&
            workData.subjects.length > 0
          ) {
            category =
              workData.subjects[0];

            console.log(
              "Thể loại lấy từ Works API:",
              category
            );
          }
        }
      } catch (error) {
        console.log(
          "Không lấy được thể loại từ Works API:",
          error
        );
      }
    }

    // Nếu API hoàn toàn không có
    if (!category) {
      category =
        "Chưa xác định";
    }

    // ==========================================
    // BƯỚC 6: LẤY ẢNH BÌA
    // ==========================================

    const image =
      book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
        : "";

    // ==========================================
    // BƯỚC 7: KIỂM TRA TÊN SÁCH
    // ==========================================

    if (!title) {
      Alert.alert(
        "Không tìm thấy thông tin",
        "API không trả về tên sách. Bạn có thể nhập thông tin thủ công.",
        [
          {
            text: "OK",
            onPress: () => {
              setScanned(false);
            },
          },
        ]
      );

      return;
    }

    // ==========================================
    // BƯỚC 8: CHUYỂN SANG FORM THÊM SÁCH
    // ==========================================

    console.log(
      "===== THÔNG TIN SÁCH ====="
    );

    console.log(
      "ISBN:",
      cleanISBN
    );

    console.log(
      "Tên:",
      title
    );

    console.log(
      "Tác giả:",
      author
    );

    console.log(
      "Thể loại:",
      category
    );

    console.log(
      "Ảnh:",
      image
    );

    navigation.replace(
      "AddBook",
      {
        scannedBook: {
          isbn: cleanISBN,
          title,
          author,
          category,
          image,
        },
      }
    );

  } catch (error) {
    console.error(
      "Lỗi tra cứu ISBN:",
      error
    );

    Alert.alert(
      "Lỗi",
      "Không thể lấy thông tin sách từ API.\n\nBạn có thể thử lại hoặc nhập sách thủ công.",
      [
        {
          text: "Thử lại",
          onPress: () => {
            setScanned(false);
          },
        },
      ]
    );

  } finally {
    setLoading(false);
  }
};

  const handleBarcodeScanned = ({
    data,
  }: {
    data: string;
  }) => {
    if (scanned || loading) {
      return;
    }

    const isbn =
      data.replace(/[-\s]/g, "");

    console.log(
      "Barcode nhận được:",
      isbn
    );

    if (!isValidISBN13(isbn)) {
      console.log(
        "Không phải ISBN-13 hợp lệ:",
        isbn
      );

      return;
    }

    setScanned(true);

    fetchBookByISBN(isbn);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#5146E5"
        />

        <Text style={styles.message}>
          Đang kiểm tra quyền camera...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionTitle}>
          Cần quyền camera
        </Text>

        <Text style={styles.message}>
          Ứng dụng cần sử dụng camera
          để quét mã ISBN của sách.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>
            Cho phép camera
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={
          scanned
            ? undefined
            : handleBarcodeScanned
        }
        barcodeScannerSettings={{
          barcodeTypes: ["ean13"],
        }}
      />

      <View style={styles.overlay}>
        <View style={styles.scanBox} />

        <Text style={styles.instruction}>
          Đưa mã vạch ISBN vào khung
        </Text>

        <Text style={styles.hint}>
          Chỉ nhận ISBN-13 bắt đầu
          bằng 978 hoặc 979
        </Text>
      </View>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator
            size="large"
            color="#5146E5"
          />

          <Text style={styles.loadingText}>
            Đang tìm thông tin sách...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  camera: {
    flex: 1,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  scanBox: {
    width: 300,
    height: 150,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderRadius: 16,
  },

  instruction: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 20,
    backgroundColor:
      "rgba(0,0,0,0.65)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },

  hint: {
    color: "#FFFFFF",
    fontSize: 13,
    marginTop: 8,
    backgroundColor:
      "rgba(0,0,0,0.55)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  loadingBox: {
    position: "absolute",
    left: 30,
    right: 30,
    bottom: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#172033",
  },

  center: {
    flex: 1,
    backgroundColor: "#F6F8FC",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  permissionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#172033",
  },

  message: {
    fontSize: 15,
    color: "#667085",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },

  button: {
    backgroundColor: "#5146E5",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});