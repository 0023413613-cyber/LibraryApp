import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./types";

import BookListScreen from "../screens/BookListScreen";
import BookDetailScreen from "../screens/BookDetailScreen";
import AddBookScreen from "../screens/AddBookScreen";
import EditBookScreen from "../screens/EditBookScreen";
import BorrowBookScreen from "../screens/BorrowBookScreen";
import ReturnBookScreen from "../screens/ReturnBookScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="BookList"
      screenOptions={{
        headerTitleAlign: "center",
        headerTintColor: "#2196F3",
        
      }}
    >
      <Stack.Screen
        name="BookList"
        component={BookListScreen}
        options={{
          title: "Tủ sách",
        }}
      />

      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{
          title: "Chi tiết sách",
        }}
      />

      <Stack.Screen
        name="AddBook"
        component={AddBookScreen}
        options={{
          title: "Thêm sách",
        }}
      />

      <Stack.Screen
        name="EditBook"
        component={EditBookScreen}
        options={{
          title: "Chỉnh sửa sách",
        }}
      />

      <Stack.Screen
        name="ReturnBook"
        component={ReturnBookScreen}
        options={{
          title: "Trả sách",
        }}
      />

      <Stack.Screen
        name="BorrowBook"
        component={BorrowBookScreen}
        options={{
          title: "Cho mượn sách",
        }}
      />
    </Stack.Navigator>
  );
}