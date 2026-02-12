import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-canvas">
      {/* Warm gradient header area */}
      <View className="absolute top-0 left-0 right-0 h-[45%] bg-sunset-soft rounded-b-lg" />

      <View
        className="flex-1 justify-between px-xl"
        style={{ paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 }}
      >
        {/* Top section: Logo and tagline */}
        <View className="items-center pt-3xl">
          <Text className="font-jakarta-bold text-5xl text-ink tracking-tight">
            DRIFTR
          </Text>
          <View className="w-12 h-1 bg-sunset rounded-sm mt-lg mb-xl" />
          <Text className="font-jakarta-semibold text-2xl text-ink text-center leading-8">
            Find your people{"\n"}on the road
          </Text>
          <Text className="font-jakarta text-base text-ink-secondary text-center mt-md leading-6 px-lg">
            Dating, friends, and builder help{"\n"}for van lifers
          </Text>
        </View>

        {/* Middle: Van emoji cluster for warmth */}
        <View className="items-center py-xl">
          <Text className="text-6xl">🚐</Text>
        </View>

        {/* Bottom section: Actions */}
        <View className="items-center">
          <Pressable
            className="w-full bg-sunset py-4 px-6 rounded-sm items-center active:bg-sunset-hover"
            onPress={() => router.push("/(auth)/signup")}
            accessibilityRole="button"
            accessibilityLabel="Get Started"
          >
            <Text className="font-jakarta-bold text-lg text-white">
              Get Started
            </Text>
          </Pressable>

          <Pressable
            className="mt-xl py-sm"
            onPress={() => router.push("/(auth)/login")}
            accessibilityRole="button"
            accessibilityLabel="I already have an account"
          >
            <Text className="font-jakarta-medium text-base text-ink-secondary">
              I already have an account
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
