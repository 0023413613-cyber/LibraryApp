import { getDatabase } from "./database";
import { Book } from "../models/Book";

// Lấy tất cả sách
export async function getAllBooks(): Promise<Book[]> {
  const db = getDatabase();

  if (!db) {
    throw new Error("Database chưa được khởi tạo.");
  }

  return await db.getAllAsync<Book>(
    "SELECT * FROM Books ORDER BY id DESC"
  );
}

// Lấy 1 quyển sách
export async function getBookById(id: number): Promise<Book | null> {
  const db = getDatabase();

  if (!db) {
    throw new Error("Database chưa được khởi tạo.");
  }

  return await db.getFirstAsync<Book>(
    "SELECT * FROM Books WHERE id = ?",
    [id]
  );
}

// Thêm sách
export async function insertBook(
  book: Omit<Book, "id">
) {
  const db = getDatabase();

  if (!db) {
    throw new Error("Database chưa được khởi tạo.");
  }

  const result = await db.runAsync(
    `
    INSERT INTO Books
    (title, author, category, image, status)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      book.title.trim(),
      book.author.trim(),
      book.category.trim(),
      book.image,
      book.status,
    ]
  );

  return result;
}

// Cập nhật sách
export async function updateBook(book: Book) {
  const db = getDatabase();

  if (!db) {
    throw new Error("Database chưa được khởi tạo.");
  }

  await db.runAsync(
    `
    UPDATE Books
    SET
      title = ?,
      author = ?,
      category = ?,
      image = ?,
      status = ?
    WHERE id = ?
    `,
    [
      book.title.trim(),
      book.author.trim(),
      book.category.trim(),
      book.image,
      book.status,
      book.id,
    ]
  );
}

// Xóa 1 sách
export async function deleteBook(id: number) {
  const db = getDatabase();

  if (!db) {
    throw new Error("Database chưa được khởi tạo.");
  }

  // Không cho xóa sách đang được mượn
  const book = await getBookById(id);

  if (!book) {
    throw new Error("Không tìm thấy sách.");
  }

  if (book.status === "borrowed") {
    throw new Error(
      `Không thể xóa "${book.title}" vì sách đang được mượn.`
    );
  }

  await db.runAsync(
    "DELETE FROM Books WHERE id = ?",
    [id]
  );
}

// Xóa nhiều sách cùng lúc
// Xóa nhiều sách cùng lúc
export async function deleteBooks(ids: number[]) {
  const db = getDatabase();

  if (!db) {
    throw new Error("Database chưa được khởi tạo.");
  }

  if (!ids || ids.length === 0) {
    return {
      deleted: 0,
      skipped: [],
    };
  }

  // Đảm bảo ID luôn là number
  const normalizedIds = ids
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id));

  if (normalizedIds.length === 0) {
    return {
      deleted: 0,
      skipped: [],
    };
  }

  console.log(
    "DELETE - IDs nhận được:",
    normalizedIds
  );

  const placeholders = normalizedIds
    .map(() => "?")
    .join(",");

  // Lấy các sách được chọn
  const books = await db.getAllAsync<Book>(
    `
    SELECT *
    FROM Books
    WHERE id IN (${placeholders})
    `,
    normalizedIds
  );

  console.log(
    "DELETE - Sách tìm được:",
    books
  );

  if (books.length === 0) {
    throw new Error(
      "Không tìm thấy sách cần xóa."
    );
  }

  // Không cho xóa sách đang được mượn
  const skippedBooks = books.filter(
    (book) =>
      book.status === "borrowed"
  );

  // Chỉ lấy sách có thể xóa
  const availableBooks = books.filter(
    (book) =>
      book.status === "available"
  );

  if (availableBooks.length === 0) {
    return {
      deleted: 0,
      skipped: skippedBooks.map(
        (book) => book.title
      ),
    };
  }

  const availableIds =
    availableBooks.map(
      (book) => Number(book.id)
    );

  const availablePlaceholders =
    availableIds
      .map(() => "?")
      .join(",");

  console.log(
    "DELETE - IDs sẽ xóa:",
    availableIds
  );

  // Thực hiện DELETE
  const result = await db.runAsync(
    `
    DELETE FROM Books
    WHERE id IN (${availablePlaceholders})
    `,
    availableIds
  );

  console.log(
    "DELETE - Số dòng đã xóa:",
    result.changes
  );

  return {
    deleted: result.changes,
    skipped: skippedBooks.map(
      (book) => book.title
    ),
  };
}