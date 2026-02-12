import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth-store";
import type { VanType, TravelStyle } from "@/types/database";

const VAN_TYPES: { emoji: string; label: string; value: VanType }[] = [
  { emoji: "\uD83D\uDE90", label: "Campervan", value: "campervan" },
  { emoji: "\uD83D\uDE8C", label: "Skoolie", value: "skoolie" },
  { emoji: "\uD83D\uDE97", label: "Car Camper", value: "car" },
  { emoji: "\uD83C\uDFD5\uFE0F", label: "RV / Motorhome", value: "rv" },
  { emoji: "\uD83D\uDE9B", label: "Truck Camper", value: "truck" },
  { emoji: "\u2728", label: "Planning", value: "other" },
];

const TRAVEL_STYLES: { label: string; value: TravelStyle }[] = [
  { label: "Fulltime", value: "fulltime" },
  { label: "Part-time", value: "parttime" },
  { label: "Weekender", value: "weekender" },
  { label: "Planning", value: "planning" },
];

export default function VanLifeScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuthStore();

  const [vanType, setVanType] = useState<VanType | null>(null);
  const [travelStyle, setTravelStyle] = useState<TravelStyle | null>(null);
  const [onRoadSince, setOnRoadSince] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleContinue() {
    if (!vanType) {
      setError("Please select your van type.");
      return;
    }
    if (!travelStyle) {
      setError("Please select your travel style.");
      return;
    }

    setError(null);
    setIsLoading(true);

    await updateProfile({
      van_type: vanType,
      travel_style: travelStyle,
      on_road_since: onRoadSince.trim() || null,
    });

    setIsLoading(false);
    router.push("/(onboarding)/photo");
  }

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View className="flex-1 px-xl pt-2xl">
        {/* Header */}
        <Text className="font-jakarta-bold text-3xl text-ink mb-sm">
          Your van life
        </Text>
        <Text className="font-jakarta text-base text-ink-secondary mb-2xl">
          What does life on the road look like for you?
        </Text>

        {/* Van Type Grid */}
        <View className="mb-2xl">
          <Text className="font-jakarta-medium text-sm text-ink-secondary mb-sm">
            What do you travel in?
          </Text>
          <View className="flex-row flex-wrap gap-sm">
            {VAN_TYPES.map((option) => (
              <Pressable
                key={option.value}
                className={`w-[31%] items-center py-lg px-sm rounded-sm border ${
                  vanType === option.value
                    ? "bg-sunset-soft border-sunset"
                    : "bg-surface-raise border-ink/8"
                }`}
                onPress={() => {
                  setVanType(option.value);
                  setError(null);
                }}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: vanType === option.value }}
              >
                <Text className="text-2xl mb-xs">{option.emoji}</Text>
                <Text
                  className={`font-jakarta-medium text-xs text-center ${
                    vanType === option.value ? "text-sunset" : "text-ink"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Travel Style */}
        <View className="mb-2xl">
          <Text className="font-jakarta-medium text-sm text-ink-secondary mb-sm">
            Travel style
          </Text>
          <View className="flex-row flex-wrap gap-sm">
            {TRAVEL_STYLES.map((option) => (
              <Pressable
                key={option.value}
                className={`flex-1 min-w-[22%] items-center py-md px-sm rounded-sm border ${
                  travelStyle === option.value
                    ? "bg-sunset border-sunset"
                    : "bg-surface-raise border-ink/8"
                }`}
                onPress={() => {
                  setTravelStyle(option.value);
                  setError(null);
                }}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: travelStyle === option.value }}
              >
                <Text
                  className={`font-jakarta-medium text-sm ${
                    travelStyle === option.value ? "text-white" : "text-ink"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* On the road since */}
        <View className="mb-2xl">
          <Text className="font-jakarta-medium text-sm text-ink-secondary mb-xs">
            On the road since (optional)
          </Text>
          <TextInput
            className="bg-surface-raise border border-ink/8 rounded-sm px-lg py-3.5 text-ink font-jakarta text-base"
            placeholder="e.g. March 2023"
            placeholderTextColor="#A8A29E"
            value={onRoadSince}
            onChangeText={setOnRoadSince}
            accessibilityLabel="On the road since"
          />
        </View>

        {error && (
          <Text className="font-jakarta text-sm text-danger mb-lg" role="alert">
            {error}
          </Text>
        )}

        {/* Continue button */}
        <View className="flex-1 justify-end">
          <Pressable
            className={`w-full py-4 px-6 rounded-sm items-center ${
              isLoading ? "bg-sunset/70" : "bg-sunset active:bg-sunset-hover"
            }`}
            onPress={handleContinue}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Continue"
            accessibilityState={{ disabled: isLoading }}
          >
            <Text className="font-jakarta-bold text-lg text-white">
              Continue
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
