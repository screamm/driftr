import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth-store";
import type { Gender } from "@/types/database";

const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: "Man", value: "man" },
  { label: "Woman", value: "woman" },
  { label: "Non-binary", value: "nonbinary" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
];

export default function BasicsScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuthStore();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleContinue() {
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    const ageNum = parseInt(age, 10);
    if (!age.trim() || isNaN(ageNum)) {
      setError("Please enter your age.");
      return;
    }
    if (ageNum < 18) {
      setError("You must be at least 18 years old.");
      return;
    }
    if (ageNum > 120) {
      setError("Please enter a valid age.");
      return;
    }

    if (!gender) {
      setError("Please select your gender.");
      return;
    }

    setError(null);
    setIsLoading(true);

    await updateProfile({
      name: name.trim(),
      age: ageNum,
      gender,
    });

    setIsLoading(false);
    router.push("/(onboarding)/van-life");
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-xl pt-2xl">
          {/* Header */}
          <Text className="font-jakarta-bold text-3xl text-ink mb-sm">
            The basics
          </Text>
          <Text className="font-jakarta text-base text-ink-secondary mb-2xl">
            Tell us a bit about yourself
          </Text>

          {/* Form */}
          <View className="gap-xl">
            {/* Name */}
            <View>
              <Text className="font-jakarta-medium text-sm text-ink-secondary mb-xs">
                Your name
              </Text>
              <TextInput
                className="bg-surface-raise border border-ink/8 rounded-sm px-lg py-3.5 text-ink font-jakarta text-base"
                placeholder="What should we call you?"
                placeholderTextColor="#A8A29E"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError(null);
                }}
                autoCapitalize="words"
                autoComplete="given-name"
                textContentType="givenName"
                accessibilityLabel="Your name"
              />
            </View>

            {/* Age */}
            <View>
              <Text className="font-jakarta-medium text-sm text-ink-secondary mb-xs">
                Your age
              </Text>
              <TextInput
                className="bg-surface-raise border border-ink/8 rounded-sm px-lg py-3.5 text-ink font-jakarta text-base"
                placeholder="Age"
                placeholderTextColor="#A8A29E"
                value={age}
                onChangeText={(text) => {
                  // Only allow digits
                  const cleaned = text.replace(/[^0-9]/g, "");
                  setAge(cleaned);
                  setError(null);
                }}
                keyboardType="number-pad"
                maxLength={3}
                accessibilityLabel="Your age"
              />
            </View>

            {/* Gender */}
            <View>
              <Text className="font-jakarta-medium text-sm text-ink-secondary mb-sm">
                Gender
              </Text>
              <View className="flex-row flex-wrap gap-sm">
                {GENDER_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    className={`px-lg py-md rounded-sm border ${
                      gender === option.value
                        ? "bg-sunset border-sunset"
                        : "bg-surface-raise border-ink/8"
                    }`}
                    onPress={() => {
                      setGender(option.value);
                      setError(null);
                    }}
                    accessibilityRole="radio"
                    accessibilityLabel={option.label}
                    accessibilityState={{ selected: gender === option.value }}
                  >
                    <Text
                      className={`font-jakarta-medium text-sm ${
                        gender === option.value ? "text-white" : "text-ink"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {error && (
            <Text className="font-jakarta text-sm text-danger mt-lg" role="alert">
              {error}
            </Text>
          )}

          {/* Continue button at bottom */}
          <View className="flex-1 justify-end mt-2xl">
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
    </KeyboardAvoidingView>
  );
}
