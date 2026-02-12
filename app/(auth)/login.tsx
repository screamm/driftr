import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setError(null);
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError(signInError.message);
    }
    // Navigation handled by auth listener in root layout
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-xl">
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            className="mb-2xl py-xs"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text className="font-jakarta-medium text-base text-ink-secondary">
              ← Back
            </Text>
          </Pressable>

          {/* Header */}
          <Text className="font-jakarta-bold text-3xl text-ink mb-sm">
            Welcome back
          </Text>
          <Text className="font-jakarta text-base text-ink-secondary mb-2xl">
            Sign in to continue your journey
          </Text>

          {/* Form */}
          <View className="gap-lg">
            <View>
              <Text className="font-jakarta-medium text-sm text-ink-secondary mb-xs">
                Email
              </Text>
              <TextInput
                className="bg-surface-raise border border-ink/8 rounded-sm px-lg py-3.5 text-ink font-jakarta text-base"
                placeholder="your@email.com"
                placeholderTextColor="#A8A29E"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                accessibilityLabel="Email address"
              />
            </View>

            <View>
              <Text className="font-jakarta-medium text-sm text-ink-secondary mb-xs">
                Password
              </Text>
              <TextInput
                className="bg-surface-raise border border-ink/8 rounded-sm px-lg py-3.5 text-ink font-jakarta text-base"
                placeholder="Your password"
                placeholderTextColor="#A8A29E"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError(null);
                }}
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                accessibilityLabel="Password"
              />
            </View>

            {error && (
              <Text className="font-jakarta text-sm text-danger" role="alert">
                {error}
              </Text>
            )}

            <Pressable
              className={`w-full py-4 px-6 rounded-sm items-center mt-sm ${
                isLoading ? "bg-sunset/70" : "bg-sunset active:bg-sunset-hover"
              }`}
              onPress={handleSignIn}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              accessibilityState={{ disabled: isLoading }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-jakarta-bold text-lg text-white">
                  Sign In
                </Text>
              )}
            </Pressable>
          </View>

          {/* Footer link */}
          <View className="flex-row justify-center mt-xl">
            <Text className="font-jakarta text-base text-ink-secondary">
              Don't have an account?{" "}
            </Text>
            <Pressable
              onPress={() => router.replace("/(auth)/signup")}
              accessibilityRole="link"
              accessibilityLabel="Sign up"
            >
              <Text className="font-jakarta-semibold text-base text-sunset">
                Sign up
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
