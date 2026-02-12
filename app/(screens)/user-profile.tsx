import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { X, Calendar } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import StatusBadge from "@/components/StatusBadge";
import VerifiedBadge from "@/components/VerifiedBadge";
import WaveButton from "@/components/WaveButton";
import VideoIntro from "@/components/VideoIntro";
import type { Profile } from "@/types/database";
import { format } from "date-fns";

const vanLabels: Record<string, string> = {
  campervan: "Campervan",
  skoolie: "Skoolie",
  sprinter: "Sprinter",
  rv: "RV",
  car: "Car",
  truck: "Truck",
  other: "Other",
};

const travelLabels: Record<string, string> = {
  fulltime: "Full-time",
  parttime: "Part-time",
  weekender: "Weekender",
  planning: "Planning",
};

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMatched, setHasMatched] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (profileError) throw profileError;

        if (data) {
          setProfile(data as Profile);
        }

        // Check if there is an existing match
        if (user?.id) {
          const { data: matchData } = await supabase
            .from("matches")
            .select("id")
            .or(
              `and(user_a.eq.${user.id},user_b.eq.${id}),and(user_a.eq.${id},user_b.eq.${user.id})`,
            )
            .limit(1)
            .single();

          if (matchData) {
            setHasMatched(true);
            setMatchId(matchData.id);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, user?.id]);

  const handleWave = async () => {
    if (!user?.id || !id) return;

    try {
      const { error: waveError } = await supabase.from("waves").insert({
        from_user: user.id,
        to_user: id,
        mode: "friends",
      });

      if (waveError) throw waveError;
    } catch {
      Alert.alert("Oops", "Something went wrong sending your wave. Please try again.");
    }
  };

  const handleMessage = () => {
    if (matchId) {
      router.push(`/(screens)/chat?matchId=${matchId}`);
    }
  };

  if (loading) {
    return (
      <View
        className="flex-1 bg-canvas items-center justify-center"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#F06428" />
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="flex-1 bg-canvas items-center justify-center"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-ink-secondary font-jakarta-medium text-[16px]">
          Something went wrong
        </Text>
        <Text className="text-ink-tertiary font-jakarta text-[14px] mt-[4px]">
          {error}
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View
        className="flex-1 bg-canvas items-center justify-center"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-ink-secondary font-jakarta-medium text-[16px]">
          Profile not found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      {/* Close button */}
      <View className="flex-row justify-end px-xl pt-md">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-full bg-surface-raise items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Close profile"
        >
          <X size={18} color="#1C1917" strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Large photo */}
        <View className="items-center px-xl pt-sm">
          {profile.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              className="w-full aspect-square rounded-lg mb-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full aspect-square rounded-lg bg-surface-raise items-center justify-center mb-xl">
              <Text className="text-ink-tertiary text-[64px]">
                {profile.name?.charAt(0)?.toUpperCase() ?? "?"}
              </Text>
            </View>
          )}
        </View>

        {/* Name + Age */}
        <View className="px-xl">
          <View className="flex-row items-center mb-[6px]">
            <Text className="text-ink font-jakarta-bold text-[26px]">
              {profile.name}
            </Text>
            {profile.is_verified && <VerifiedBadge size={22} />}
            {profile.age && (
              <Text className="text-ink-secondary font-jakarta text-[20px] ml-[6px]">
                {profile.age}
              </Text>
            )}
          </View>

          {/* Status badge + Van type + Travel style */}
          <View className="flex-row items-center flex-wrap gap-[8px] mb-lg">
            <StatusBadge status={profile.status} size="md" />
            {profile.van_type && (
              <View className="bg-surface-raise rounded-sm px-md py-[4px]">
                <Text className="text-ink-secondary font-jakarta-medium text-[13px]">
                  {"\uD83D\uDE90"} {vanLabels[profile.van_type] ?? profile.van_type}
                </Text>
              </View>
            )}
            {profile.travel_style && (
              <View className="bg-surface-raise rounded-sm px-md py-[4px]">
                <Text className="text-ink-secondary font-jakarta-medium text-[13px]">
                  {travelLabels[profile.travel_style] ?? profile.travel_style}
                </Text>
              </View>
            )}
          </View>

          {/* Bio */}
          {profile.bio && (
            <Text className="text-ink-secondary font-jakarta text-[15px] leading-[22px] mb-lg">
              {profile.bio}
            </Text>
          )}

          {/* Video intro */}
          {profile.video_intro_url && (
            <View className="mb-lg">
              <Text className="text-ink font-jakarta-semibold text-[16px] mb-[8px]">
                Video Intro
              </Text>
              <VideoIntro uri={profile.video_intro_url} />
            </View>
          )}

          {/* On the road since */}
          {profile.on_road_since && (
            <View className="bg-surface rounded-md p-lg flex-row items-center mb-lg"
              style={{ borderWidth: 1, borderColor: "rgba(28,25,23,0.08)" }}
            >
              <Calendar size={18} color="#F06428" strokeWidth={1.8} />
              <Text className="text-ink-secondary font-jakarta-medium text-[14px] ml-[8px]">
                On the road since{" "}
                {format(new Date(profile.on_road_since), "MMMM yyyy")}
              </Text>
            </View>
          )}

          {/* Location */}
          {profile.location_name && (
            <View className="bg-surface rounded-md p-lg flex-row items-center mb-xl"
              style={{ borderWidth: 1, borderColor: "rgba(28,25,23,0.08)" }}
            >
              <Text className="text-[16px] mr-[8px]">{"\uD83D\uDCCD"}</Text>
              <Text className="text-ink-secondary font-jakarta-medium text-[14px]">
                {profile.location_name}
              </Text>
            </View>
          )}

          {/* Action buttons */}
          {user?.id !== profile.id && (
            <View className="gap-[10px]">
              {hasMatched ? (
                <Pressable
                  onPress={handleMessage}
                  className="bg-sunset rounded-md py-lg items-center justify-center"
                  accessibilityRole="button"
                  accessibilityLabel="Send message"
                >
                  <Text className="text-white font-jakarta-semibold text-[16px]">
                    Message
                  </Text>
                </Pressable>
              ) : (
                <WaveButton
                  onPress={handleWave}
                  mode="friends"
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
