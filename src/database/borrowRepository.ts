// import { getDatabase } from "./database";

// /**
//  * Mượn sách
//  */
// export async function borrowBook(
//   bookId: number,
//   borrower: string,
//   phone: string,
//   borrowDate: string,
//   dueDate: string
// ) {
//   const db = getDatabase();

//   // Kiểm tra sách có đang được mượn hay không
//   const existingBorrow = await db.getFirstAsync<{
//     id: number;
//   }>(
//     `SELECT id
//      FROM BorrowHistory
//      WHERE bookId = ?
//        AND returnDate IS NULL`,
//     [bookId]
//   );

//   if (existingBorrow) {
//     throw new Error("Sách này đang được mượn.");
//   }

//   // Thêm lịch sử mượn
//   await db.runAsync(
//     `INSERT INTO BorrowHistory
//       (bookId, borrower, phone, borrowDate, dueDate)
//      VALUES (?, ?, ?, ?, ?)`,
//     [bookId, borrower, phone, borrowDate, dueDate]
//   );

//   // Cập nhật trạng thái sách
//   await db.runAsync(
//     `UPDATE Books
//      SET status = 'borrowed'
//      WHERE id = ?`,
//     [bookId]
//   );
// }

// /**
//  * Trả sách
//  */
// export async function returnBook(
//   borrowId: number,
//   bookId: number
// ) {
//   const db = getDatabase();

//   if (!db) {
//     throw new Error("Database chưa được khởi tạo.");
//   }

//   const today = new Date()
//     .toISOString()
//     .split("T")[0];

//   await db.withExclusiveTransactionAsync(async (txn) => {
//     const borrow = await txn.getFirstAsync<{
//       id: number;
//       bookId: number;
//     }>(
//       `SELECT id, bookId
//        FROM BorrowHistory
//        WHERE id = ?
//          AND returnDate IS NULL`,
//       [borrowId]
//     );

//     if (!borrow) {
//       throw new Error(
//         "Phiếu mượn không tồn tại hoặc sách đã được trả."
//       );
//     }

//     const targetBookId = Number(bookId ?? borrow.bookId);

//     await txn.runAsync(
//       `UPDATE BorrowHistory
//        SET returnDate = ?
//        WHERE id = ?`,
//       [today, borrowId]
//     );

//     await txn.runAsync(
//       `UPDATE Books
//        SET status = 'available'
//        WHERE id = ?`,
//       [targetBookId]
//     );
//   });
// }

// /**
//  * Lấy danh sách sách đang được mượn
//  */
// export async function getBorrowingBooks() {
//   const db = getDatabase();

//   return await db.getAllAsync(
//     `SELECT
//       BorrowHistory.id,
//       BorrowHistory.bookId,
//       BorrowHistory.borrower,
//       BorrowHistory.phone,
//       BorrowHistory.borrowDate,
//       BorrowHistory.dueDate,
//       BorrowHistory.returnDate,
//       Books.title,
//       Books.author,
//       Books.image
//     FROM BorrowHistory
//     INNER JOIN Books
//       ON Books.id = BorrowHistory.bookId
//     WHERE BorrowHistory.returnDate IS NULL
//     ORDER BY BorrowHistory.id DESC`
//   );
// }

// /**
//  * Lấy toàn bộ lịch sử mượn / trả
//  */
// export async function getBorrowHistory() {
//   const db = getDatabase();

//   return await db.getAllAsync(
//     `SELECT
//       BorrowHistory.id,
//       BorrowHistory.bookId,
//       BorrowHistory.borrower,
//       BorrowHistory.phone,
//       BorrowHistory.borrowDate,
//       BorrowHistory.dueDate,
//       BorrowHistory.returnDate,
//       Books.title,
//       Books.author,
//       Books.image
//     FROM BorrowHistory
//     INNER JOIN Books
//       ON Books.id = BorrowHistory.bookId
//     ORDER BY BorrowHistory.id DESC`
//   );
// }

// /**
//  * Lấy danh sách sách quá hạn
//  */
// export async function getOverdueBooks() {
//   const db = getDatabase();

//   const today = new Date()
//     .toISOString()
//     .split("T")[0];

//   return await db.getAllAsync(
//     `SELECT
//       BorrowHistory.id,
//       BorrowHistory.bookId,
//       BorrowHistory.borrower,
//       BorrowHistory.phone,
//       BorrowHistory.borrowDate,
//       BorrowHistory.dueDate,
//       BorrowHistory.returnDate,
//       Books.title,
//       Books.author,
//       Books.image
//     FROM BorrowHistory
//     INNER JOIN Books
//       ON Books.id = BorrowHistory.bookId
//     WHERE BorrowHistory.returnDate IS NULL
//       AND BorrowHistory.dueDate < ?
//     ORDER BY BorrowHistory.dueDate ASC`,
//     [today]
//   );
// }

import { getDatabase } from "./database";

/**
 * Mượn sách
 */
export async function borrowBook(
  bookId: number,
  borrower: string,
  phone: string,
  borrowDate: string,
  dueDate: string
) {
  const db = getDatabase();

  // Kiểm tra sách có đang được mượn hay không
  const existingBorrow = await db.getFirstAsync<{
    id: number;
  }>(
    `SELECT id
     FROM BorrowHistory
     WHERE bookId = ?
       AND returnDate IS NULL`,
    [bookId]
  );

  if (existingBorrow) {
    throw new Error("Sách này đang được mượn.");
  }

  // Thêm lịch sử mượn
  await db.runAsync(
    `INSERT INTO BorrowHistory
      (bookId, borrower, phone, borrowDate, dueDate)
     VALUES (?, ?, ?, ?, ?)`,
    [bookId, borrower, phone, borrowDate, dueDate]
  );

  // Cập nhật trạng thái sách
  await db.runAsync(
    `UPDATE Books
     SET status = 'borrowed'
     WHERE id = ?`,
    [bookId]
  );
}

/**
 * Trả sách
 *
 * Lưu ý: Không dùng withExclusiveTransactionAsync ở đây vì
 * expo-sqlite 16 không hỗ trợ API này trên Expo Web.
 * Thay vào đó dùng cùng database connection với 2 câu lệnh
 * tuần tự để Web có thể trả sách bình thường.
 * Sách quá hạn vẫn được phép trả.
 */
export async function returnBook(
  borrowId: number,
  bookId?: number
) {
  const db = getDatabase();

  if (!db) {
    throw new Error("Database chưa được khởi tạo.");
  }

  const borrow = await db.getFirstAsync<{
    id: number;
    bookId: number;
  }>(
    `SELECT id, bookId
     FROM BorrowHistory
     WHERE id = ?
       AND returnDate IS NULL`,
    [borrowId]
  );

  if (!borrow) {
    throw new Error(
      "Phiếu mượn không tồn tại hoặc sách đã được trả."
    );
  }

  const targetBookId = Number(
    bookId ?? borrow.bookId
  );

  if (targetBookId !== Number(borrow.bookId)) {
    throw new Error("Thông tin sách không khớp với phiếu mượn.");
  }

  // Dùng ngày địa phương để tránh lệch ngày khi chạy trên Web.
  const now = new Date();
  const today = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

  // Đóng phiếu mượn. Không kiểm tra dueDate nên sách quá hạn
  // vẫn trả được bình thường.
  const borrowResult = await db.runAsync(
    `UPDATE BorrowHistory
     SET returnDate = ?
     WHERE id = ?
       AND returnDate IS NULL`,
    [today, borrowId]
  );

  if (borrowResult.changes === 0) {
    throw new Error(
      "Không thể cập nhật phiếu mượn. Có thể sách vừa được trả."
    );
  }

  // Sau khi phiếu được đóng, đưa sách về trạng thái có sẵn.
  const bookResult = await db.runAsync(
    `UPDATE Books
     SET status = 'available'
     WHERE id = ?`,
    [targetBookId]
  );

  if (bookResult.changes === 0) {
    throw new Error("Không tìm thấy sách để cập nhật trạng thái.");
  }
}

/**
 * Lấy danh sách sách đang được mượn
 */
export async function getBorrowingBooks() {
  const db = getDatabase();

  return await db.getAllAsync(
    `SELECT
      BorrowHistory.id,
      BorrowHistory.bookId,
      BorrowHistory.borrower,
      BorrowHistory.phone,
      BorrowHistory.borrowDate,
      BorrowHistory.dueDate,
      BorrowHistory.returnDate,
      Books.title,
      Books.author,
      Books.image
    FROM BorrowHistory
    INNER JOIN Books
      ON Books.id = BorrowHistory.bookId
    WHERE BorrowHistory.returnDate IS NULL
    ORDER BY BorrowHistory.id DESC`
  );
}

/**
 * Lấy toàn bộ lịch sử mượn / trả
 */
export async function getBorrowHistory() {
  const db = getDatabase();

  return await db.getAllAsync(
    `SELECT
      BorrowHistory.id,
      BorrowHistory.bookId,
      BorrowHistory.borrower,
      BorrowHistory.phone,
      BorrowHistory.borrowDate,
      BorrowHistory.dueDate,
      BorrowHistory.returnDate,
      Books.title,
      Books.author,
      Books.image
    FROM BorrowHistory
    INNER JOIN Books
      ON Books.id = BorrowHistory.bookId
    ORDER BY BorrowHistory.id DESC`
  );
}

/**
 * Lấy danh sách sách quá hạn
 */
export async function getOverdueBooks() {
  const db = getDatabase();

  const today = new Date()
    .toISOString()
    .split("T")[0];

  return await db.getAllAsync(
    `SELECT
      BorrowHistory.id,
      BorrowHistory.bookId,
      BorrowHistory.borrower,
      BorrowHistory.phone,
      BorrowHistory.borrowDate,
      BorrowHistory.dueDate,
      BorrowHistory.returnDate,
      Books.title,
      Books.author,
      Books.image
    FROM BorrowHistory
    INNER JOIN Books
      ON Books.id = BorrowHistory.bookId
    WHERE BorrowHistory.returnDate IS NULL
      AND BorrowHistory.dueDate < ?
    ORDER BY BorrowHistory.dueDate ASC`,
    [today]
  );
}