import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth-store";
import type { LookingFor, Gender } from "@/types/database";

interface LookingForOption {
  emoji: string;
  label: string;
  description: string;
  value: LookingFor;
  color: string;
  bgColor: string;
}

const LOOKING_FOR_OPTIONS: LookingForOption[] = [
  {
    emoji: "\uD83E\uDDE1",
    label: "Dating",
    description: "Find romantic connections",
    value: "dating",
    color: "text-match",
    bgColor: "bg-match-soft",
  },
  {
    emoji: "\uD83D\uDC4B",
    label: "Friends",
    description: "Meet fellow travelers",
    value: "friends",
    color: "text-parked",
    bgColor: "bg-parked-soft",
  },
  {
    emoji: "\uD83D\uDD27",
    label: "Builder Help",
    description: "Find help with van projects",
    value: "builder_help",
    color: "text-rolling",
    bgColor: "bg-rolling-soft",
  },
];

const INTERESTED_IN_OPTIONS: { label: string; value: Gender }[] = [
  { label: "Men", value: "man" },
  { label: "Women", value: "woman" },
  { label: "Everyone", value: "nonbinary" },
];

export default function LookingForScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuthStore();

  const [selected, setSelected] = useState<LookingFor[]>([]);
  const [interestedIn, setInterestedIn] = useState<Gender[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function toggleSelection(value: LookingFor) {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
    setError(null);
  }

  function toggleInterestedIn(value: Gender) {
    if (value === "nonbinary") {
      // "Everyone" selects all
      setInterestedIn(["man", "woman", "nonbinary"]);
      return;
    }
    setInterestedIn((prev) => {
      const filtered = prev.filter((v) => v !== "nonbinary");
      if (filtered.includes(value)) {
        return filtered.filter((v) => v !== value);
      }
      return [...filtered, value];
    });
  }

  const showInterestedIn = selected.includes("dating");

  async function handleContinue() {
    if (selected.length === 0) {
      setError("Please select at least one option.");
      return;
    }
    if (showInterestedIn && interestedIn.length === 0) {
      setError("Please select who you're interested in.");
      return;
    }

    setError(null);
    setIsLoading(true);

    await updateProfile({
      looking_for: selected,
      interested_in: showInterestedIn ? interestedIn : [],
    });

    setIsLoading(false);
    router.push("/(onboarding)/location");
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
          What are you looking for?
        </Text>
        <Text className="font-jakarta text-base text-ink-secondary mb-2xl">
          Select all that apply. You can change this anytime.
        </Text>

        {/* Selection Cards */}
        <View className="gap-md mb-2xl">
          {LOOKING_FOR_OPTIONS.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <Pressable
                key={option.value}
                className={`p-xl rounded-md border-2 ${
                  isSelected
                    ? `${option.bgColor} border-current`
                    : "bg-surface-raise border-transparent"
                }`}
                style={
                  isSelected
                    ? {
                        borderColor:
                          option.value === "dating"
                            ? "#D4577A"
                            : option.value === "friends"
                            ? "#4D9B6A"
                            : "#D4912A",
                      }
                    : { borderColor: "rgba(28,25,23,0.08)" }
                }
                onPress={() => toggleSelection(option.value)}
                accessibilityRole="checkbox"
                accessibilityLabel={`${option.label}: ${option.description}`}
                accessibilityState={{ checked: isSelected }}
              >
                <View className="flex-row items-center">
                  <Text className="text-3xl mr-lg">{option.emoji}</Text>
                  <View className="flex-1">
                    <Text className="font-jakarta-bold text-lg text-ink">
                      {option.label}
                    </Text>
                    <Text className="font-jakarta text-sm text-ink-secondary mt-1">
                      {option.description}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="w-6 h-6 rounded-full bg-sunset items-center justify-center">
                      <Text className="text-white text-xs font-jakarta-bold">
                        ✓
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Interested In (shown when Dating is selected) */}
        {showInterestedIn && (
          <View className="mb-2xl">
            <Text className="font-jakarta-medium text-sm text-ink-secondary mb-sm">
              Interested in
            </Text>
            <View className="flex-row gap-sm">
              {INTERESTED_IN_OPTIONS.map((option) => {
                const isSelected =
                  option.value === "nonbinary"
                    ? interestedIn.length === 3
                    : interestedIn.includes(option.value);
                return (
                  <Pressable
                    key={option.value}
                    className={`flex-1 py-md rounded-sm border items-center ${
                      isSelected
                        ? "bg-sunset border-sunset"
                        : "bg-surface-raise border-ink/8"
                    }`}
                    onPress={() => toggleInterestedIn(option.value)}
                    accessibilityRole="checkbox"
                    accessibilityLabel={`Interested in ${option.label}`}
                    accessibilityState={{ checked: isSelected }}
                  >
                    <Text
                      className={`font-jakarta-medium text-sm ${
                        isSelected ? "text-white" : "text-ink"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

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
