import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync("library.db");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT NOT NULL,
      image TEXT,
      status TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS BorrowHistory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        bookId INTEGER NOT NULL,

        borrower TEXT NOT NULL,

        phone TEXT,

        borrowDate TEXT NOT NULL,

        dueDate TEXT NOT NULL,

        returnDate TEXT,

        FOREIGN KEY(bookId) REFERENCES Books(id)
    );
  `);
}

export function getDatabase() {
  return db;
}