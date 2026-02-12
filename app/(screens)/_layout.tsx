import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FAF8F5" },
      }}
    >
      <Stack.Screen
        name="user-profile"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="chat"
        options={{ presentation: "card" }}
      />
      <Stack.Screen
        name="paywall"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="builder-detail"
        options={{ presentation: "card" }}
      />
      <Stack.Screen
        name="matches"
        options={{ presentation: "card" }}
      />
      <Stack.Screen
        name="settings"
        options={{ presentation: "card" }}
      />
    </Stack>
  );
}
