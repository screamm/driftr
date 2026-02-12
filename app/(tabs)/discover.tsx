import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Region } from "react-native-maps";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { BadgeCheck, Navigation } from "lucide-react-native";
import { useLocation } from "@/hooks/useLocation";
import { useNearbyProfiles } from "@/hooks/useNearbyProfiles";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase";
import { useWaveLimit } from "@/hooks/useWaveLimit";
import { router } from "expo-router";
import MapPin from "@/components/MapPin";
import type { NearbyProfile, ConnectionMode } from "@/types/database";

const RADIUS_OPTIONS = [10, 25, 50, 100, 250] as const;
const MODE_OPTIONS = ["all", "dating", "friends"] as const;
type ModeFilter = (typeof MODE_OPTIONS)[number];

const VAN_LABELS: Record<string, string> = {
  campervan: "Campervan",
  skoolie: "Skoolie",
  sprinter: "Sprinter",
  rv: "RV",
  car: "Car Camper",
  truck: "Truck",
  other: "Other",
};

const STYLE_LABELS: Record<string, string> = {
  fulltime: "Full-time",
  parttime: "Part-time",
  weekender: "Weekender",
  planning: "Planning",
};

const DELTA_FOR_RADIUS: Record<number, number> = {
  10: 0.15,
  25: 0.35,
  50: 0.7,
  100: 1.4,
  250: 3.5,
};

export default function DiscoverScreen() {
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedRadius, setSelectedRadius] = useState<number>(50);
  const [selectedMode, setSelectedMode] = useState<ModeFilter>("all");
  const [selectedProfile, setSelectedProfile] =
    useState<NearbyProfile | null>(null);

  const { latitude, longitude, loading: locationLoading } = useLocation();
  const { user } = useAuthStore();
  const { canWave, wavesRemaining, isPremium, incrementWave } = useWaveLimit();

  const {
    profiles,
    loading: profilesLoading,
    fetchNearby,
  } = useNearbyProfiles({
    radiusKm: selectedRadius,
    mode: selectedMode === "all" ? "all" : selectedMode,
  });

  const snapPoints = useMemo(() => ["38%", "55%"], []);

  // Fetch profiles on initial location load
  useEffect(() => {
    if (latitude && longitude) {
      fetchNearby(latitude, longitude);
    }
  }, [latitude, longitude, selectedRadius, selectedMode]);

  const handleRegionChange = useCallback(
    (region: Region) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        fetchNearby(region.latitude, region.longitude);
      }, 500);
    },
    [fetchNearby],
  );

  const handleMarkerPress = useCallback(
    (profile: NearbyProfile) => {
      setSelectedProfile(profile);
      bottomSheetRef.current?.snapToIndex(0);
    },
    [],
  );

  const handleViewProfile = useCallback(() => {
    if (!selectedProfile) return;
    bottomSheetRef.current?.close();
    router.push({
      pathname: "/(screens)/user-profile",
      params: { userId: selectedProfile.id },
    });
  }, [selectedProfile]);

  const handleWave = useCallback(async () => {
    if (!selectedProfile || !user || !canWave) return;

    try {
      const { error: waveError } = await supabase.from("waves").insert({
        from_user: user.id,
        to_user: selectedProfile.id,
        mode: selectedMode === "dating" ? "dating" : "friends",
      });

      if (waveError) throw waveError;

      await incrementWave();
    } catch {
      Alert.alert("Oops", "Something went wrong sending your wave. Please try again.");
    }
  }, [selectedProfile, user, canWave, incrementWave, selectedMode]);

  const handleRecenter = useCallback(() => {
    if (latitude && longitude && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: DELTA_FOR_RADIUS[selectedRadius] ?? 0.7,
        longitudeDelta: DELTA_FOR_RADIUS[selectedRadius] ?? 0.7,
      });
    }
  }, [latitude, longitude, selectedRadius]);

  const visibleProfiles = profiles
    .filter((p) => p.id !== user?.id)
    .slice(0, 50);

  if (locationLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator size="large" color="#F06428" />
        <Text className="mt-lg font-jakarta text-ink-secondary text-sm">
          Finding your location...
        </Text>
      </View>
    );
  }

  const initialRegion: Region = {
    latitude: latitude ?? 40.7128,
    longitude: longitude ?? -74.006,
    latitudeDelta: DELTA_FOR_RADIUS[selectedRadius] ?? 0.7,
    longitudeDelta: DELTA_FOR_RADIUS[selectedRadius] ?? 0.7,
  };

  return (
    <View className="flex-1 bg-canvas">
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation
        showsMyLocationButton={false}
        mapType="standard"
      >
        {visibleProfiles.map((profile) => {
          if (!profile.latitude || !profile.longitude) return null;
          return (
            <Marker
              key={profile.id}
              coordinate={{
                latitude: profile.latitude,
                longitude: profile.longitude,
              }}
              onPress={() => handleMarkerPress(profile)}
            >
              <MapPin
                avatar_url={profile.avatar_url}
                name={profile.name}
                status={profile.status}
              />
            </Marker>
          );
        })}
      </MapView>

      {/* Filter Bar */}
      <SafeAreaView edges={["top"]} className="absolute left-0 right-0 top-0">
        <View className="mx-lg mt-sm">
          {/* Radius Chips */}
          <View
            className="flex-row rounded-lg p-xs"
            style={styles.filterContainer}
          >
            {RADIUS_OPTIONS.map((radius) => (
              <Pressable
                key={radius}
                onPress={() => setSelectedRadius(radius)}
                className={`mr-xs rounded-md px-md py-sm ${
                  selectedRadius === radius ? "bg-sunset" : "bg-transparent"
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedRadius === radius }}
                accessibilityLabel={`${radius} kilometer radius`}
              >
                <Text
                  className={`font-jakarta-medium text-xs ${
                    selectedRadius === radius ? "text-white" : "text-ink-secondary"
                  }`}
                >
                  {radius} km
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Mode Filter */}
          <View
            className="mt-sm flex-row rounded-lg p-xs"
            style={styles.filterContainer}
          >
            {MODE_OPTIONS.map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setSelectedMode(mode)}
                className={`mr-xs rounded-md px-md py-sm ${
                  selectedMode === mode ? "bg-sunset" : "bg-transparent"
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedMode === mode }}
                accessibilityLabel={`${mode === "all" ? "All" : mode} mode filter`}
              >
                <Text
                  className={`font-jakarta-medium text-xs capitalize ${
                    selectedMode === mode ? "text-white" : "text-ink-secondary"
                  }`}
                >
                  {mode === "all" ? "All" : mode === "dating" ? "Dating" : "Friends"}
                </Text>
              </Pressable>
            ))}

            {/* Loading indicator */}
            {profilesLoading && (
              <View className="ml-auto justify-center px-sm">
                <ActivityIndicator size="small" color="#F06428" />
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Recenter Button */}
      <Pressable
        onPress={handleRecenter}
        className="absolute bottom-28 right-lg h-12 w-12 items-center justify-center rounded-full bg-white"
        style={styles.recenterShadow}
        accessibilityRole="button"
        accessibilityLabel="Recenter map on your location"
      >
        <Navigation size={20} color="#1C1917" strokeWidth={1.8} />
      </Pressable>

      {/* Profile Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView className="flex-1 px-xl">
          {selectedProfile && (
            <ProfilePreview
              profile={selectedProfile}
              canWave={canWave}
              wavesRemaining={wavesRemaining}
              isPremium={isPremium}
              onViewProfile={handleViewProfile}
              onWave={handleWave}
            />
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

interface ProfilePreviewProps {
  profile: NearbyProfile;
  canWave: boolean;
  wavesRemaining: number;
  isPremium: boolean;
  onViewProfile: () => void;
  onWave: () => void;
}

function ProfilePreview({
  profile,
  canWave,
  wavesRemaining,
  isPremium,
  onViewProfile,
  onWave,
}: ProfilePreviewProps) {
  const statusColor = profile.status === "parked" ? "#4D9B6A" : "#D4912A";
  const statusBgColor =
    profile.status === "parked" ? "bg-parked-soft" : "bg-rolling-soft";
  const statusLabel = profile.status === "parked" ? "Parked" : "Rolling";

  return (
    <View className="flex-1">
      {/* Header Row */}
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className="mr-lg">
          <View
            className="h-16 w-16 rounded-full border-2"
            style={{ borderColor: statusColor }}
          >
            {profile.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                className="h-full w-full rounded-full"
                accessibilityLabel={`${profile.name}'s profile photo`}
              />
            ) : (
              <View className="h-full w-full items-center justify-center rounded-full bg-surface-raise">
                <Text className="font-jakarta-bold text-xl text-ink-secondary">
                  {profile.name?.charAt(0)?.toUpperCase() ?? "?"}
                </Text>
              </View>
            )}
          </View>
          {/* Status dot on avatar */}
          <View
            className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-surface"
            style={{ backgroundColor: statusColor }}
          />
        </View>

        {/* Name + Meta */}
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text
              className="font-jakarta-bold text-lg text-ink"
              numberOfLines={1}
            >
              {profile.name}
            </Text>
            {profile.age && (
              <Text className="ml-sm font-jakarta text-ink-secondary">
                {profile.age}
              </Text>
            )}
            {profile.is_verified && (
              <View className="ml-sm">
                <BadgeCheck size={16} color="#F06428" strokeWidth={2} />
              </View>
            )}
          </View>

          {/* Van type + Travel style */}
          <View className="mt-xs flex-row items-center">
            {profile.van_type && (
              <Text className="font-jakarta text-xs text-ink-secondary">
                {VAN_LABELS[profile.van_type] ?? profile.van_type}
              </Text>
            )}
            {profile.van_type && profile.travel_style && (
              <Text className="mx-xs text-ink-tertiary">{"  \u00B7  "}</Text>
            )}
            {profile.travel_style && (
              <Text className="font-jakarta text-xs text-ink-secondary">
                {STYLE_LABELS[profile.travel_style] ?? profile.travel_style}
              </Text>
            )}
          </View>

          {/* Status badge + distance */}
          <View className="mt-sm flex-row items-center">
            <View className={`rounded-md px-sm py-xs ${statusBgColor}`}>
              <Text
                className="font-jakarta-medium text-xs"
                style={{ color: statusColor }}
              >
                {statusLabel}
              </Text>
            </View>
            <Text className="ml-sm font-jakarta text-xs text-ink-tertiary">
              {profile.distance_km < 1
                ? "< 1 km away"
                : `${Math.round(profile.distance_km)} km away`}
            </Text>
          </View>
        </View>
      </View>

      {/* Bio */}
      {profile.bio && (
        <Text
          className="mt-lg font-jakarta text-sm leading-5 text-ink-secondary"
          numberOfLines={2}
        >
          {profile.bio}
        </Text>
      )}

      {/* Actions */}
      <View className="mt-xl flex-row">
        <Pressable
          onPress={onViewProfile}
          className="mr-sm flex-1 items-center rounded-lg border py-md"
          style={{ borderColor: "rgba(28,25,23,0.08)" }}
          accessibilityRole="button"
          accessibilityLabel={`View ${profile.name}'s full profile`}
        >
          <Text className="font-jakarta-semibold text-sm text-ink">
            View Profile
          </Text>
        </Pressable>

        <Pressable
          onPress={onWave}
          disabled={!canWave}
          className={`flex-1 items-center rounded-lg py-md ${
            canWave ? "bg-sunset" : "bg-ink-muted"
          }`}
          accessibilityRole="button"
          accessibilityLabel={
            canWave
              ? `Send a wave to ${profile.name}`
              : "No waves remaining today"
          }
        >
          <Text
            className={`font-jakarta-semibold text-sm ${
              canWave ? "text-white" : "text-ink-tertiary"
            }`}
          >
            Wave 👋
          </Text>
        </Pressable>
      </View>

      {/* Wave limit indicator for free users */}
      {!isPremium && (
        <Text className="mt-sm text-center font-jakarta text-xs text-ink-tertiary">
          {wavesRemaining > 0
            ? `${wavesRemaining} wave${wavesRemaining !== 1 ? "s" : ""} remaining today`
            : "No waves left today. Go Premium for unlimited."}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    backgroundColor: "rgba(250,248,245,0.92)",
    borderWidth: 1,
    borderColor: "rgba(28,25,23,0.08)",
  },
  bottomSheetBackground: {
    backgroundColor: "#F5F2ED",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: "#D6D3D1",
    width: 40,
  },
  recenterShadow: {
    shadowColor: "#1C1917",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(28,25,23,0.08)",
  },
});
