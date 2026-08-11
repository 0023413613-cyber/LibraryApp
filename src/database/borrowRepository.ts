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
 */
export async function returnBook(
  borrowId: number,
  bookId: number
) {
  const db = getDatabase();

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // Kiểm tra phiếu mượn có tồn tại và chưa trả
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

  // Cập nhật ngày trả
  await db.runAsync(
    `UPDATE BorrowHistory
     SET returnDate = ?
     WHERE id = ?`,
    [today, borrowId]
  );

  // Cập nhật trạng thái sách
  // Sử dụng bookId lấy trực tiếp từ BorrowHistory
  await db.runAsync(
    `UPDATE Books
     SET status = 'available'
     WHERE id = ?`,
    [borrow.bookId]
  );
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