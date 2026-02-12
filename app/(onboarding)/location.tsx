import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { useAuthStore } from "@/stores/auth-store";
import type { UserStatus } from "@/types/database";

export default function LocationScreen() {
  const insets = useSafeAreaInsets();
  const { updateProfile, setIsOnboarded } = useAuthStore();

  const [locationName, setLocationName] = useState<string | null>(null);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [status, setStatus] = useState<UserStatus>("parked");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGetLocation() {
    setIsFetchingLocation(true);
    setError(null);

    const { status: permStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (permStatus !== "granted") {
      Alert.alert(
        "Location Permission",
        "We need your location to show nearby van lifers. You can set this later in your settings."
      );
      setIsFetchingLocation(false);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setCoords({ latitude, longitude });

      // Reverse geocode to get a friendly name
      const [place] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (place) {
        const parts = [place.city, place.region, place.country].filter(
          Boolean
        );
        setLocationName(parts.join(", ") || "Location found");
      } else {
        setLocationName("Location found");
      }
    } catch {
      setError("Could not determine your location. Please try again.");
    }

    setIsFetchingLocation(false);
  }

  async function handleFinish() {
    setError(null);
    setIsLoading(true);

    const updates: Record<string, unknown> = {
      status,
      location_updated_at: new Date().toISOString(),
    };

    if (coords) {
      updates.latitude = coords.latitude;
      updates.longitude = coords.longitude;
      updates.location_name = locationName;
    }

    await updateProfile(updates);
    setIsOnboarded(true);

    setIsLoading(false);
    router.replace("/(tabs)/discover");
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
          Set your location
        </Text>
        <Text className="font-jakarta text-base text-ink-secondary mb-2xl">
          Help nearby van lifers find you
        </Text>

        {/* Location button / result */}
        <View className="items-center mb-3xl">
          {locationName ? (
            <View className="items-center">
              <View className="w-20 h-20 rounded-full bg-parked-soft items-center justify-center mb-lg">
                <Text className="text-3xl">📍</Text>
              </View>
              <Text className="font-jakarta-semibold text-lg text-ink text-center">
                {locationName}
              </Text>
              <Pressable
                className="mt-md"
                onPress={handleGetLocation}
                accessibilityRole="button"
                accessibilityLabel="Refresh location"
              >
                <Text className="font-jakarta-medium text-sm text-sunset">
                  Refresh location
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              className={`w-full py-xl rounded-md border-2 border-dashed items-center ${
                isFetchingLocation
                  ? "border-sunset/30 bg-sunset-soft"
                  : "border-ink/8 bg-surface-raise"
              }`}
              onPress={handleGetLocation}
              disabled={isFetchingLocation}
              accessibilityRole="button"
              accessibilityLabel="Use my location"
            >
              {isFetchingLocation ? (
                <View className="items-center">
                  <ActivityIndicator size="large" color="#F06428" />
                  <Text className="font-jakarta-medium text-sm text-ink-secondary mt-md">
                    Finding your location...
                  </Text>
                </View>
              ) : (
                <View className="items-center">
                  <Text className="text-3xl mb-sm">📍</Text>
                  <Text className="font-jakarta-bold text-base text-ink">
                    Use My Location
                  </Text>
                  <Text className="font-jakarta text-xs text-ink-tertiary mt-xs">
                    We only share your general area
                  </Text>
                </View>
              )}
            </Pressable>
          )}
        </View>

        {/* Status Toggle */}
        <View className="mb-2xl">
          <Text className="font-jakarta-medium text-sm text-ink-secondary mb-sm">
            What's your status?
          </Text>
          <View className="flex-row gap-sm">
            <Pressable
              className={`flex-1 py-lg rounded-sm border items-center ${
                status === "parked"
                  ? "bg-parked-soft border-parked"
                  : "bg-surface-raise border-ink/8"
              }`}
              onPress={() => setStatus("parked")}
              accessibilityRole="radio"
              accessibilityLabel="Parked - staying in one place"
              accessibilityState={{ selected: status === "parked" }}
            >
              <Text className="text-xl mb-xs">🅿️</Text>
              <Text
                className={`font-jakarta-bold text-base ${
                  status === "parked" ? "text-parked" : "text-ink"
                }`}
              >
                Parked
              </Text>
              <Text className="font-jakarta text-xs text-ink-secondary mt-1">
                Staying a while
              </Text>
            </Pressable>

            <Pressable
              className={`flex-1 py-lg rounded-sm border items-center ${
                status === "rolling"
                  ? "bg-rolling-soft border-rolling"
                  : "bg-surface-raise border-ink/8"
              }`}
              onPress={() => setStatus("rolling")}
              accessibilityRole="radio"
              accessibilityLabel="Rolling - on the move"
              accessibilityState={{ selected: status === "rolling" }}
            >
              <Text className="text-xl mb-xs">🛞</Text>
              <Text
                className={`font-jakarta-bold text-base ${
                  status === "rolling" ? "text-rolling" : "text-ink"
                }`}
              >
                Rolling
              </Text>
              <Text className="font-jakarta text-xs text-ink-secondary mt-1">
                On the move
              </Text>
            </Pressable>
          </View>
        </View>

        {error && (
          <Text className="font-jakarta text-sm text-danger mb-lg" role="alert">
            {error}
          </Text>
        )}

        {/* Finish button */}
        <View className="flex-1 justify-end">
          <Pressable
            className={`w-full py-4 px-6 rounded-sm items-center ${
              isLoading ? "bg-sunset/70" : "bg-sunset active:bg-sunset-hover"
            }`}
            onPress={handleFinish}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Start exploring"
            accessibilityState={{ disabled: isLoading }}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-jakarta-bold text-lg text-white">
                Start Exploring
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
