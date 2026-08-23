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

  ReturnBook: undefined;
};

  

export type BottomTabParamList = {
  Home: undefined;
  Books: undefined;
  Borrow: undefined;
  History: undefined;
};