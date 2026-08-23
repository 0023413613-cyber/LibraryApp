export interface Borrow {
  id: number;

  bookId: number;

  borrower: string;

  phone: string;

  borrowDate: string;

  dueDate: string;

  returnDate: string | null;

  title?: string;

  author?: string;

  image?: string;
}