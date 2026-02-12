import React from "react";
import { View, Text, Image, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import {
  Truck,
  Bus,
  Car,
  Caravan,
  BadgeCheck,
  MapPin,
} from "lucide-react-native";
import type { NearbyProfile, ConnectionMode } from "@/types/database";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 120;
const MAX_ROTATION = 12;

interface SwipeCardProps {
  profile: NearbyProfile;
  onWave: () => void;
  onSkip: () => void;
  isFirst: boolean;
  mode?: ConnectionMode;
}

const VAN_TYPE_ICONS: Record<string, React.ElementType> = {
  campervan: Truck,
  sprinter: Truck,
  skoolie: Bus,
  rv: Caravan,
  car: Car,
  truck: Truck,
  other: Truck,
};

const VAN_TYPE_LABELS: Record<string, string> = {
  campervan: "Campervan",
  sprinter: "Sprinter",
  skoolie: "Skoolie",
  rv: "RV",
  car: "Car",
  truck: "Truck",
  other: "Other",
};

const TRAVEL_STYLE_LABELS: Record<string, string> = {
  fulltime: "Full-time",
  parttime: "Part-time",
  weekender: "Weekender",
  planning: "Planning",
};

export function formatDistance(km: number): string {
  if (km < 1) return "<1 km";
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export default function SwipeCard({
  profile,
  onWave,
  onSkip,
  isFirst,
  mode = "dating",
}: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardScale = useSharedValue(isFirst ? 1 : 0.95);

  const accentColor = mode === "dating" ? "#F06428" : "#4D9B6A";

  const VanIcon = profile.van_type
    ? VAN_TYPE_ICONS[profile.van_type] ?? Truck
    : Truck;

  const panGesture = Gesture.Pan()
    .enabled(isFirst)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3;
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        translateY.value = withTiming(event.translationY * 0.5, {
          duration: 300,
        });
        runOnJS(onWave)();
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        translateY.value = withTiming(event.translationY * 0.5, {
          duration: 300,
        });
        runOnJS(onSkip)();
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-MAX_ROTATION, 0, MAX_ROTATION],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
        { scale: cardScale.value },
      ],
    };
  });

  const rightOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 0.3],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const leftOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [0.3, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  React.useEffect(() => {
    if (isFirst) {
      cardScale.value = withSpring(1, { damping: 15, stiffness: 120 });
    } else {
      cardScale.value = withSpring(0.95, { damping: 15, stiffness: 120 });
    }
  }, [isFirst]);

  const isVerified = !!profile.video_intro_url;
  const statusColor =
    profile.status === "parked" ? "#4D9B6A" : "#D4912A";
  const statusLabel =
    profile.status === "parked" ? "Parked" : "Rolling";

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        className="absolute w-full bg-surface-raise rounded-lg overflow-hidden"
        style={[
          cardAnimatedStyle,
          {
            borderWidth: 1,
            borderColor: "rgba(28,25,23,0.08)",
          },
        ]}
      >
        {/* Photo section - 70% height */}
        <View className="relative" style={{ height: "70%" }}>
          <Image
            source={{
              uri:
                profile.avatar_url ??
                `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "?")}&size=400&background=EFECE6&color=57534E&bold=true&format=png`,
            }}
            className="w-full h-full"
            style={{ borderTopLeftRadius: 14, borderTopRightRadius: 14 }}
            resizeMode="cover"
          />

          {/* Swipe color overlays */}
          <Animated.View
            className="absolute inset-0 rounded-t-lg"
            style={[
              rightOverlayStyle,
              {
                backgroundColor:
                  mode === "dating"
                    ? "rgba(240,100,40,0.4)"
                    : "rgba(77,155,106,0.4)",
              },
            ]}
            pointerEvents="none"
          />
          <Animated.View
            className="absolute inset-0 rounded-t-lg"
            style={[
              leftOverlayStyle,
              { backgroundColor: "rgba(196,68,58,0.35)" },
            ]}
            pointerEvents="none"
          />

          {/* Dark gradient scrim at bottom of photo */}
          <View
            className="absolute bottom-0 left-0 right-0 px-lg pb-lg pt-3xl"
            style={{ backgroundColor: "transparent" }}
          >
            <View
              className="absolute inset-0"
              style={{
                backgroundColor: "rgba(0,0,0,0.45)",
              }}
            />
            <View className="flex-row items-center gap-sm">
              <Text
                className="font-jakarta-bold text-2xl relative"
                style={{ color: "#FFFFFF" }}
              >
                {profile.name}
                {profile.age ? `, ${profile.age}` : ""}
              </Text>
              {isVerified && (
                <BadgeCheck
                  size={20}
                  color={accentColor}
                  fill={accentColor}
                  style={{ position: "relative" }}
                />
              )}
            </View>
          </View>
        </View>

        {/* Info section below photo */}
        <View className="px-lg py-md" style={{ height: "30%" }}>
          {/* Van type + travel style + distance row */}
          <View className="flex-row items-center gap-sm mb-sm">
            <View className="flex-row items-center gap-xs">
              <VanIcon size={14} color="#57534E" />
              <Text
                className="font-jakarta-medium text-xs text-ink-secondary"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {profile.van_type
                  ? VAN_TYPE_LABELS[profile.van_type] ?? profile.van_type
                  : "Van"}
              </Text>
            </View>
            <Text className="text-ink-muted text-xs">|</Text>
            <Text
              className="font-jakarta-medium text-xs text-ink-secondary"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {profile.travel_style
                ? TRAVEL_STYLE_LABELS[profile.travel_style] ??
                  profile.travel_style
                : "Nomad"}
            </Text>
            <Text className="text-ink-muted text-xs">|</Text>
            <View className="flex-row items-center gap-xs">
              <MapPin size={12} color="#57534E" />
              <Text
                className="font-jakarta-medium text-xs text-ink-secondary"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {formatDistance(profile.distance_km)}
              </Text>
            </View>
          </View>

          {/* Status badge */}
          <View className="flex-row items-center gap-sm mb-sm">
            <View
              className="flex-row items-center gap-xs px-sm py-xs rounded-sm"
              style={{
                backgroundColor:
                  profile.status === "parked"
                    ? "#EDF5F0"
                    : "#FDF5E8",
              }}
            >
              <View
                className="rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  backgroundColor: statusColor,
                }}
              />
              <Text
                className="font-jakarta-medium text-xs"
                style={{ color: statusColor }}
              >
                {statusLabel}
              </Text>
            </View>
            {profile.location_name && (
              <Text
                className="font-jakarta text-xs text-ink-tertiary flex-1"
                numberOfLines={1}
              >
                {profile.location_name}
              </Text>
            )}
          </View>

          {/* Bio */}
          {profile.bio && (
            <Text
              className="font-jakarta text-sm text-ink-secondary leading-5"
              numberOfLines={2}
            >
              {profile.bio}
            </Text>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
