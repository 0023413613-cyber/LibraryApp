import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Text,
  TouchableOpacity,
} from "react-native";
import type { RootStackParamList } from "./types";

import BookListScreen from "../screens/BookListScreen";
import BookDetailScreen from "../screens/BookDetailScreen";
import AddBookScreen from "../screens/AddBookScreen";
import EditBookScreen from "../screens/EditBookScreen";
import BorrowBookScreen from "../screens/BorrowBookScreen";
import ReturnBookScreen from "../screens/ReturnBookScreen";
import ScanISBNScreen from "../screens/ScanISBNScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="BookList"
      screenOptions={{
        headerTitleAlign: "center",
        headerTintColor: "#5146E5",
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
        options={({ navigation }) => ({
          title: "Thêm sách",
          headerShown: true,
          headerBackVisible: false,

          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                marginLeft: 12,
                padding: 6,
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: 30,
                  color: "#4F46E5",
                  lineHeight: 30,
                }}
              >
                ‹
              </Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="ScanISBN"
        component={ScanISBNScreen}
        options={{
          title: "Quét ISBN",
        }}
      />
      <Stack.Screen
        name="EditBook"
        component={EditBookScreen}
        options={{
          title: "Sửa sách",
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