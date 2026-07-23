import { getDatabase } from "./database";
import { Book } from "../models/Book";

// Lấy tất cả sách
export async function getAllBooks(): Promise<Book[]> {
  const db = getDatabase();

  const books = await db.getAllAsync<Book>(
    "SELECT * FROM Books ORDER BY id DESC"
  );

  return books;
}

// Thêm sách
export async function insertBook(book: Omit<Book, "id">) {
  const db = getDatabase();

  const result = await db.runAsync(
    `INSERT INTO Books
    (title, author, category, image, status)
    VALUES (?, ?, ?, ?, ?)`,
    [
      book.title,
      book.author,
      book.category,
      book.image,
      book.status,
    ]
  );

  console.log("Insert result:", result);
}

// Xóa sách
export async function deleteBook(id: number) {
  const db = getDatabase();

  await db.runAsync(
    "DELETE FROM Books WHERE id = ?",
    [id]
  );
}

// Cập nhật sách
export async function updateBook(book: Book) {
  const db = getDatabase();

  await db.runAsync(
    `UPDATE Books
     SET
     title=?,
     author=?,
     category=?,
     image=?,
     status=?
     WHERE id=?`,
    [
      book.title,
      book.author,
      book.category,
      book.image,
      book.status,
      book.id,
    ]
  );
  
}
// Lấy 1 quyển sách theo id
export async function getBookById(id: number) {
  const db = getDatabase();

  return await db.getFirstAsync<Book>(
    "SELECT * FROM Books WHERE id = ?",
    [id]
  );
}