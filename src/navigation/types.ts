import type { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  BookList: undefined;
  BookDetail: {
    bookId: number;
  };
  AddBook:
  | {
      scannedBook?: {
        isbn: string;
        title: string;
        author: string;
        category: string;
        image: string;
      };
    }
  | undefined;

  ScanISBN: undefined;
  EditBook: {
    bookId: number;
  };
  BorrowBook: {
    bookId: number;
  };
  ReturnBook: {
    bookId: number;
  };
  
};

export type BottomTabParamList = {
  Home: undefined;
  Books: NavigatorScreenParams<RootStackParamList>;
  Borrow: undefined;
  History: undefined;
  
};