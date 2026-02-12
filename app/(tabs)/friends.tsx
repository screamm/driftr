import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import SwipeCard from "@/components/SwipeCard";
import MatchCelebration from "@/components/MatchCelebration";
import { useNearbyProfiles } from "@/hooks/useNearbyProfiles";
import { useWaveLimit } from "@/hooks/useWaveLimit";
import { useLocation } from "@/hooks/useLocation";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase";
import type { NearbyProfile } from "@/types/database";

function WaveIcon({ size, color }: { size: number; color: string }) {
  return (
    <Text style={{ fontSize: size * 0.8, lineHeight: size, color }}>
      {"\u{1F44B}"}
    </Text>
  );
}

export default function FriendsScreen() {
  const router = useRouter();
  const { user, profile: myProfile } = useAuthStore();
  const { latitude, longitude, loading: locationLoading } = useLocation();
  const { profiles, loading: profilesLoading, fetchNearby } = useNearbyProfiles({ mode: "friends" });
  const {
    wavesRemaining,
    canWave,
    isPremium,
    loading: waveLimitLoading,
    incrementWave,
  } = useWaveLimit();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<NearbyProfile | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      fetchNearby(latitude, longitude);
    }
  }, [latitude, longitude, fetchNearby]);

  const currentProfile = profiles[currentIndex] ?? null;
  const nextProfile = profiles[currentIndex + 1] ?? null;
  const hasMoreProfiles = currentIndex < profiles.length;

  const advanceCard = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    advanceCard();
  }, [advanceCard]);

  const handleWave = useCallback(async () => {
    if (!user || !currentProfile || processing) return;

    if (!canWave) {
      router.push("/(screens)/paywall");
      return;
    }

    setProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Insert wave
      const { error: waveError } = await supabase.from("waves").insert({
        from_user: user.id,
        to_user: currentProfile.id,
        mode: "friends",
      });

      if (waveError) throw waveError;

      // Increment daily wave count
      await incrementWave();

      // Check if a match was created (mutual wave triggers a DB function)
      const { data: matchData } = await supabase
        .from("matches")
        .select("*")
        .eq("mode", "friends")
        .or(
          `and(user_a.eq.${user.id},user_b.eq.${currentProfile.id}),and(user_a.eq.${currentProfile.id},user_b.eq.${user.id})`
        )
        .maybeSingle();

      if (matchData) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setMatchedProfile(currentProfile);
        setShowMatch(true);
      }

      advanceCard();
    } catch {
      Alert.alert("Oops", "Something went wrong sending your wave. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, [user, currentProfile, canWave, processing, advanceCard, incrementWave, router]);

  const handleSendMessage = useCallback(() => {
    setShowMatch(false);
    if (matchedProfile) {
      router.push({
        pathname: "/(screens)/chat",
        params: { userId: matchedProfile.id },
      });
    }
  }, [matchedProfile, router]);

  const handleKeepSwiping = useCallback(() => {
    setShowMatch(false);
    setMatchedProfile(null);
  }, []);

  const isLoading = locationLoading || profilesLoading || waveLimitLoading;

  if (isLoading) {
    return (
      <View className="flex-1 bg-canvas items-center justify-center">
        <ActivityIndicator size="large" color="#4D9B6A" />
        <Text className="font-jakarta-medium text-sm text-ink-secondary mt-lg">
          Finding people nearby...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      {/* Header */}
      <View className="px-lg pt-xl pb-md">
        <Text className="font-jakarta-bold text-2xl text-ink">Friends</Text>
        {!isPremium && (
          <Text className="font-jakarta text-sm text-ink-secondary mt-xs">
            {wavesRemaining === 0
              ? "No waves left today"
              : `${wavesRemaining} wave${wavesRemaining === 1 ? "" : "s"} left today`}
          </Text>
        )}
      </View>

      {/* Card stack area */}
      <View className="flex-1 px-lg">
        {hasMoreProfiles ? (
          <View className="flex-1 relative">
            {/* Next card (behind) */}
            {nextProfile && (
              <SwipeCard
                key={nextProfile.id}
                profile={nextProfile}
                onWave={() => {}}
                onSkip={() => {}}
                isFirst={false}
                mode="friends"
              />
            )}

            {/* Current card (top) */}
            {currentProfile && (
              <SwipeCard
                key={currentProfile.id}
                profile={currentProfile}
                onWave={handleWave}
                onSkip={handleSkip}
                isFirst={true}
                mode="friends"
              />
            )}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-4xl mb-lg">🏕</Text>
            <Text className="font-jakarta-semibold text-lg text-ink text-center">
              No more profiles nearby
            </Text>
            <Text className="font-jakarta text-sm text-ink-secondary text-center mt-sm px-2xl">
              Check back later or expand your search radius in settings
            </Text>
          </View>
        )}
      </View>

      {/* Action buttons */}
      {hasMoreProfiles && (
        <View className="flex-row items-center justify-center gap-xl px-lg pb-2xl pt-lg">
          {/* Skip button */}
          <Pressable
            className="items-center justify-center rounded-full bg-surface"
            style={{
              width: 64,
              height: 64,
              borderWidth: 1,
              borderColor: "rgba(28,25,23,0.08)",
            }}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip profile"
          >
            <X size={28} color="#57534E" />
          </Pressable>

          {/* Wave button */}
          <Pressable
            className="items-center justify-center rounded-full"
            style={{
              width: 72,
              height: 72,
              backgroundColor: "#EDF5F0",
              borderWidth: 1,
              borderColor: "rgba(77,155,106,0.15)",
              opacity: processing ? 0.6 : 1,
            }}
            onPress={handleWave}
            disabled={processing}
            accessibilityRole="button"
            accessibilityLabel="Wave at profile"
          >
            <WaveIcon size={32} color="#4D9B6A" />
          </Pressable>
        </View>
      )}

      {/* Match celebration overlay */}
      <MatchCelebration
        visible={showMatch}
        currentUserAvatar={myProfile?.avatar_url ?? null}
        matchedUserAvatar={matchedProfile?.avatar_url ?? null}
        matchedUserName={matchedProfile?.name ?? ""}
        mode="friends"
        onSendMessage={handleSendMessage}
        onKeepSwiping={handleKeepSwiping}
      />
    </View>
  );
}
