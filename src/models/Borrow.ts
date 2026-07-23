export interface Borrow {
  id: number;

  bookId: number;

  borrower: string;

  phone: string;

  borrowDate: string;

  returnDate: string;

  status: "borrowing" | "returned";
}