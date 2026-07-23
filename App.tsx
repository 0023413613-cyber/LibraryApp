import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { NavigationContainer } from "@react-navigation/native";

import TabNavigator from "./src/navigation/TabNavigator";

import { initDatabase } from "./src/database/database";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      await initDatabase();
      setLoading(false);
    }

    init();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}