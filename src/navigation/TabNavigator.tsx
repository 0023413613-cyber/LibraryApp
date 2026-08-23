import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import StackNavigator from "./StackNavigator";
import BorrowListScreen from "../screens/BorrowListScreen";
import HistoryScreen from "../screens/HistoryScreen";

import type { BottomTabParamList } from "./types";
import {
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Books"
        component={StackNavigator}
        options={({ route }) => {
          const routeName =
            getFocusedRouteNameFromRoute(route) ?? "BookList";

          const hideTabBar = [
            "AddBook",
            "EditBook",
            "BookDetail",
            "BorrowBook",
            "ReturnBook",
          ].includes(routeName);

          return {
            title: "Sách",

            tabBarStyle: hideTabBar
              ? { display: "none" }
              : undefined,

            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="book"
                color={color}
                size={size}
              />
            ),
          };
        }}
      />

      <Tab.Screen
        name="Borrow"
        component={BorrowListScreen}
        options={{
          title: "Mượn",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: "Lịch sử",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}