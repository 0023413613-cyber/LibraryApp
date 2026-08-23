import type { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  BookList: undefined;
  BookDetail: {
    bookId: number;
  };
  AddBook: undefined;
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