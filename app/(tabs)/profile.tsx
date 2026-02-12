import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Settings,
  Camera,
  Video,
  Crown,
  ChevronRight,
  Heart,
  Wrench,
  Edit3,
} from "lucide-react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";
import { usePremium } from "@/hooks/usePremium";
import type { UserStatus } from "@/types/database";

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
  fulltime: "Full-time nomad",
  parttime: "Part-time traveler",
  weekender: "Weekend warrior",
  planning: "Planning the journey",
};

export default function ProfileScreen() {
  const { profile, updateProfile } = useAuthStore();
  const { isPremium } = usePremium();

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingBuilder, setIsUpdatingBuilder] = useState(false);

  const handleStatusToggle = useCallback(async () => {
    if (!profile || isUpdatingStatus) return;
    setIsUpdatingStatus(true);

    const newStatus: UserStatus =
      profile.status === "parked" ? "rolling" : "parked";

    try {
      await updateProfile({ status: newStatus });
    } catch {
      Alert.alert("Error", "Failed to update status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [profile, isUpdatingStatus, updateProfile]);

  const handleBuilderToggle = useCallback(
    async (value: boolean) => {
      if (!profile || isUpdatingBuilder) return;
      setIsUpdatingBuilder(true);

      try {
        await updateProfile({ is_builder: value });
      } catch {
        Alert.alert("Error", "Failed to update builder status.");
      } finally {
        setIsUpdatingBuilder(false);
      }
    },
    [profile, isUpdatingBuilder, updateProfile],
  );

  const handleNavigateSettings = useCallback(() => {
    router.push("/(screens)/settings");
  }, []);

  const handleNavigateMatches = useCallback(() => {
    router.push("/(screens)/matches");
  }, []);

  const handleNavigatePaywall = useCallback(() => {
    router.push("/(screens)/paywall");
  }, []);

  const handleEditProfile = useCallback(() => {
    // Navigate to edit profile screen (would go to an edit modal/screen)
    router.push("/(screens)/settings");
  }, []);

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-canvas">
        <View className="flex-1 items-center justify-center">
          <Text className="font-jakarta text-ink-secondary">
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = profile.status === "parked" ? "#4D9B6A" : "#D4912A";
  const statusBgClass =
    profile.status === "parked" ? "bg-parked-soft" : "bg-rolling-soft";
  const statusLabel = profile.status === "parked" ? "Parked" : "Rolling";
  const premiumExpiry = profile.premium_until
    ? new Date(profile.premium_until)
    : null;
  const hasPremiumAccess =
    isPremium || (premiumExpiry && premiumExpiry > new Date());

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-xl pt-lg">
          <Text className="font-jakarta-bold text-2xl text-ink">Profile</Text>
          <Pressable
            onPress={handleNavigateSettings}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface"
            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <Settings size={20} color="#57534E" strokeWidth={1.8} />
          </Pressable>
        </View>

        {/* Avatar Section */}
        <View className="mt-xl items-center">
          <View className="relative">
            <View
              className="h-28 w-28 rounded-full border-[3px]"
              style={{ borderColor: statusColor }}
            >
              {profile.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  className="h-full w-full rounded-full"
                  accessibilityLabel="Your profile photo"
                />
              ) : (
                <View className="h-full w-full items-center justify-center rounded-full bg-surface-raise">
                  <Text className="font-jakarta-bold text-3xl text-ink-secondary">
                    {profile.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </Text>
                </View>
              )}
            </View>
            {/* Edit avatar button */}
            <Pressable
              className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full bg-sunset"
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
            >
              <Camera size={16} color="#FFFFFF" strokeWidth={2} />
            </Pressable>
          </View>

          {/* Name + Age */}
          <View className="mt-lg flex-row items-center">
            <Text className="font-jakarta-bold text-xl text-ink">
              {profile.name}
            </Text>
            {profile.age && (
              <Text className="ml-sm font-jakarta text-lg text-ink-secondary">
                {profile.age}
              </Text>
            )}
          </View>

          {/* Van type + travel style */}
          <View className="mt-xs flex-row items-center">
            {profile.van_type && (
              <Text className="font-jakarta text-sm text-ink-secondary">
                {VAN_LABELS[profile.van_type] ?? profile.van_type}
              </Text>
            )}
            {profile.van_type && profile.travel_style && (
              <Text className="mx-xs text-ink-tertiary">{" \u00B7 "}</Text>
            )}
            {profile.travel_style && (
              <Text className="font-jakarta text-sm text-ink-secondary">
                {STYLE_LABELS[profile.travel_style] ?? profile.travel_style}
              </Text>
            )}
          </View>
        </View>

        {/* Status Toggle */}
        <View className="mx-xl mt-2xl">
          <Text className="mb-sm font-jakarta-semibold text-xs uppercase tracking-wider text-ink-tertiary">
            Status
          </Text>
          <View
            className="flex-row items-center justify-between rounded-lg p-lg"
            style={{
              backgroundColor: "rgba(28,25,23,0.03)",
              borderWidth: 1,
              borderColor: "rgba(28,25,23,0.08)",
            }}
          >
            <View className="flex-row items-center">
              <View
                className={`rounded-md px-md py-sm ${statusBgClass}`}
              >
                <Text
                  className="font-jakarta-semibold text-sm"
                  style={{ color: statusColor }}
                >
                  {statusLabel}
                </Text>
              </View>
              <Text className="ml-md font-jakarta text-xs text-ink-tertiary">
                {profile.status === "parked"
                  ? "Staying in one spot"
                  : "On the move"}
              </Text>
            </View>
            <Pressable
              onPress={handleStatusToggle}
              disabled={isUpdatingStatus}
              className="rounded-md bg-surface-raise px-md py-sm"
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${profile.status === "parked" ? "rolling" : "parked"} status`}
            >
              <Text className="font-jakarta-medium text-xs text-ink-secondary">
                {profile.status === "parked" ? "Go Rolling" : "Set Parked"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Bio Section */}
        <View className="mx-xl mt-2xl">
          <Text className="mb-sm font-jakarta-semibold text-xs uppercase tracking-wider text-ink-tertiary">
            About
          </Text>
          <View
            className="rounded-lg p-lg"
            style={{
              backgroundColor: "rgba(28,25,23,0.03)",
              borderWidth: 1,
              borderColor: "rgba(28,25,23,0.08)",
            }}
          >
            <Text className="font-jakarta text-sm leading-5 text-ink-secondary">
              {profile.bio || "No bio yet. Tell others about your journey."}
            </Text>
          </View>
        </View>

        {/* Video Intro */}
        <View className="mx-xl mt-2xl">
          <Text className="mb-sm font-jakarta-semibold text-xs uppercase tracking-wider text-ink-tertiary">
            Video Intro
          </Text>
          <Pressable
            className="flex-row items-center rounded-lg p-lg"
            style={{
              backgroundColor: "rgba(28,25,23,0.03)",
              borderWidth: 1,
              borderColor: "rgba(28,25,23,0.08)",
            }}
            accessibilityRole="button"
            accessibilityLabel={
              profile.video_intro_url
                ? "View your video intro"
                : "Record a video intro"
            }
          >
            <View className="mr-md h-12 w-12 items-center justify-center rounded-lg bg-sunset-soft">
              <Video size={22} color="#F06428" strokeWidth={1.8} />
            </View>
            <View className="flex-1">
              <Text className="font-jakarta-medium text-sm text-ink">
                {profile.video_intro_url
                  ? "Video intro recorded"
                  : "Record a video intro"}
              </Text>
              <Text className="mt-xs font-jakarta text-xs text-ink-tertiary">
                {profile.video_intro_url
                  ? "Verified profiles get more visibility"
                  : "Get verified and stand out"}
              </Text>
            </View>
            {profile.video_intro_url && profile.is_verified && (
              <View className="rounded-md bg-sunset-soft px-sm py-xs">
                <Text className="font-jakarta-medium text-xs text-sunset">
                  Verified
                </Text>
              </View>
            )}
            {!profile.video_intro_url && (
              <ChevronRight size={18} color="#A8A29E" strokeWidth={1.8} />
            )}
          </Pressable>
        </View>

        {/* Premium Status */}
        <View className="mx-xl mt-2xl">
          {hasPremiumAccess ? (
            <View
              className="flex-row items-center rounded-lg p-lg"
              style={{
                backgroundColor: "#FEF1EB",
                borderWidth: 1,
                borderColor: "rgba(240,100,40,0.15)",
              }}
            >
              <Crown size={22} color="#F06428" strokeWidth={1.8} />
              <View className="ml-md flex-1">
                <Text className="font-jakarta-semibold text-sm text-sunset">
                  DRIFTR Premium
                </Text>
                <Text className="mt-xs font-jakarta text-xs text-ink-secondary">
                  Unlimited waves, extended radius, and more
                </Text>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={handleNavigatePaywall}
              className="flex-row items-center rounded-lg p-lg"
              style={{
                backgroundColor: "#FEF1EB",
                borderWidth: 1,
                borderColor: "rgba(240,100,40,0.15)",
              }}
              accessibilityRole="button"
              accessibilityLabel="Go Premium for unlimited features"
            >
              <Crown size={22} color="#F06428" strokeWidth={1.8} />
              <View className="ml-md flex-1">
                <Text className="font-jakarta-semibold text-sm text-sunset">
                  Go Premium
                </Text>
                <Text className="mt-xs font-jakarta text-xs text-ink-secondary">
                  Unlimited waves, extended radius, and more
                </Text>
              </View>
              <ChevronRight size={18} color="#F06428" strokeWidth={1.8} />
            </Pressable>
          )}
        </View>

        {/* Builder Toggle */}
        <View className="mx-xl mt-2xl">
          <Text className="mb-sm font-jakarta-semibold text-xs uppercase tracking-wider text-ink-tertiary">
            Builder Services
          </Text>
          <View
            className="flex-row items-center justify-between rounded-lg p-lg"
            style={{
              backgroundColor: "rgba(28,25,23,0.03)",
              borderWidth: 1,
              borderColor: "rgba(28,25,23,0.08)",
            }}
          >
            <View className="flex-row items-center">
              <Wrench size={20} color="#57534E" strokeWidth={1.8} />
              <View className="ml-md">
                <Text className="font-jakarta-medium text-sm text-ink">
                  Offer your services
                </Text>
                <Text className="mt-xs font-jakarta text-xs text-ink-tertiary">
                  Appear in the Builders tab
                </Text>
              </View>
            </View>
            <Switch
              value={profile.is_builder}
              onValueChange={handleBuilderToggle}
              disabled={isUpdatingBuilder}
              trackColor={{ false: "#D6D3D1", true: "#F06428" }}
              thumbColor="#FFFFFF"
              accessibilityRole="switch"
              accessibilityLabel="Toggle builder services"
            />
          </View>
        </View>

        {/* Matches Button */}
        <View className="mx-xl mt-2xl">
          <Pressable
            onPress={handleNavigateMatches}
            className="flex-row items-center rounded-lg p-lg"
            style={{
              backgroundColor: "rgba(28,25,23,0.03)",
              borderWidth: 1,
              borderColor: "rgba(28,25,23,0.08)",
            }}
            accessibilityRole="button"
            accessibilityLabel="View your matches"
          >
            <Heart size={20} color="#D4577A" strokeWidth={1.8} />
            <Text className="ml-md flex-1 font-jakarta-medium text-sm text-ink">
              Your Matches
            </Text>
            <ChevronRight size={18} color="#A8A29E" strokeWidth={1.8} />
          </Pressable>
        </View>

        {/* Edit Profile Button */}
        <View className="mx-xl mt-2xl">
          <Pressable
            onPress={handleEditProfile}
            className="flex-row items-center justify-center rounded-lg bg-ink py-lg"
            accessibilityRole="button"
            accessibilityLabel="Edit your profile"
          >
            <Edit3 size={16} color="#FAF8F5" strokeWidth={2} />
            <Text className="ml-sm font-jakarta-semibold text-sm text-canvas">
              Edit Profile
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
