import { getDatabase } from "./database";

export async function borrowBook(
  bookId: number,
  borrower: string,
  phone: string,
  borrowDate: string,
  dueDate: string
) {
  const db = getDatabase();

  await db.runAsync(
    `INSERT INTO BorrowHistory
    (bookId, borrower, phone, borrowDate, dueDate)
    VALUES (?, ?, ?, ?, ?)`,
    [
      bookId,
      borrower,
      phone,
      borrowDate,
      dueDate,
    ]
  );

  await db.runAsync(
    `UPDATE Books
     SET status='borrowed'
     WHERE id=?`,
    [bookId]
  );
}
export async function returnBook(
  borrowId: number,
  bookId: number
) {
  const db = getDatabase();

  const today =
    new Date().toISOString().split("T")[0];

  await db.runAsync(
    `UPDATE BorrowHistory
     SET returnDate=?
     WHERE id=?`,
    [today, borrowId]
  );

  await db.runAsync(
    `UPDATE Books
     SET status='available'
     WHERE id=?`,
    [bookId]
  );
}
export async function getBorrowHistory() {
  const db = getDatabase();

  return await db.getAllAsync(
    `
SELECT
BorrowHistory.*,
Books.title,
Books.image

FROM BorrowHistory

INNER JOIN Books

ON Books.id = BorrowHistory.bookId

ORDER BY BorrowHistory.id DESC
`
  );
}