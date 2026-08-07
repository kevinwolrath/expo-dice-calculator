import { Link, Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable } from "react-native";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Jobs",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "square.stack.3d.up.fill",
                android: "layers",
                web: "layers",
              }}
              tintColor={color}
              size={24}
            />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable style={{ marginRight: 15 }}>
                {({ pressed }) => (
                  <SymbolView
                    name={{ ios: "info.circle", android: "info", web: "info" }}
                    size={22}
                    tintColor={Colors[colorScheme].text}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />

      <Tabs.Screen
        name="stock"
        options={{
          title: "Stock",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "cube.box", android: "inventory", web: "inventory" }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="material-types"
        options={{
          title: "Material Types",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "cube.box.fill",
                android: "category",
                web: "category",
              }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="production-methods"
        options={{
          title: "Production Methods",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: "wrench.fill", android: "build", web: "build" }}
              tintColor={color}
              size={22}
            />
          ),
        }}
      />
    </Tabs>
  );
}
