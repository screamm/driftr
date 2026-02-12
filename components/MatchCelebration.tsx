import React, { useEffect } from "react";
import { View, Text, Image, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import type { ConnectionMode } from "@/types/database";

interface MatchCelebrationProps {
  visible: boolean;
  currentUserAvatar: string | null;
  matchedUserAvatar: string | null;
  matchedUserName: string;
  mode: ConnectionMode;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

const AVATAR_SIZE = 96;
const AVATAR_BORDER = 4;

export default function MatchCelebration({
  visible,
  currentUserAvatar,
  matchedUserAvatar,
  matchedUserName,
  mode,
  onSendMessage,
  onKeepSwiping,
}: MatchCelebrationProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const leftAvatarX = useSharedValue(-60);
  const rightAvatarX = useSharedValue(60);

  const accentColor = mode === "dating" ? "#F06428" : "#4D9B6A";
  const headingText =
    mode === "dating" ? "It's a Match! \u{1F389}" : "New Friend! \u{1F44B}";
  const subtitleText =
    mode === "dating"
      ? `You and ${matchedUserName} both waved`
      : `You and ${matchedUserName} both waved`;

  useEffect(() => {
    if (visible) {
      opacity.value = withSpring(1, { damping: 20, stiffness: 100 });
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      leftAvatarX.value = withDelay(
        150,
        withSpring(-20, { damping: 14, stiffness: 120 })
      );
      rightAvatarX.value = withDelay(
        150,
        withSpring(20, { damping: 14, stiffness: 120 })
      );
    } else {
      opacity.value = 0;
      scale.value = 0.8;
      leftAvatarX.value = -60;
      rightAvatarX.value = 60;
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const leftAvatarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: leftAvatarX.value }],
  }));

  const rightAvatarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rightAvatarX.value }],
  }));

  if (!visible) return null;

  const placeholderUri =
    "https://ui-avatars.com/api/?name=%3F&size=96&background=EFECE6&color=57534E&bold=true&format=png";

  return (
    <View className="absolute inset-0 z-50" style={{ elevation: 100 }}>
      {/* Semi-transparent overlay */}
      <Animated.View
        className="absolute inset-0"
        style={[overlayStyle, { backgroundColor: "rgba(28,25,23,0.7)" }]}
      />

      {/* Content */}
      <Animated.View
        className="flex-1 items-center justify-center px-2xl"
        style={contentStyle}
      >
        {/* Avatars meeting in the center */}
        <View
          className="flex-row items-center justify-center mb-xl"
          style={{ height: AVATAR_SIZE + AVATAR_BORDER * 2 }}
        >
          <Animated.View style={leftAvatarStyle}>
            <View
              className="rounded-full overflow-hidden"
              style={{
                width: AVATAR_SIZE + AVATAR_BORDER * 2,
                height: AVATAR_SIZE + AVATAR_BORDER * 2,
                borderWidth: AVATAR_BORDER,
                borderColor: accentColor,
              }}
            >
              <Image
                source={{ uri: currentUserAvatar ?? placeholderUri }}
                style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                resizeMode="cover"
              />
            </View>
          </Animated.View>

          <Animated.View style={rightAvatarStyle}>
            <View
              className="rounded-full overflow-hidden"
              style={{
                width: AVATAR_SIZE + AVATAR_BORDER * 2,
                height: AVATAR_SIZE + AVATAR_BORDER * 2,
                borderWidth: AVATAR_BORDER,
                borderColor: accentColor,
              }}
            >
              <Image
                source={{ uri: matchedUserAvatar ?? placeholderUri }}
                style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                resizeMode="cover"
              />
            </View>
          </Animated.View>
        </View>

        {/* Heading */}
        <Text
          className="font-jakarta-bold text-3xl text-center mb-sm"
          style={{ color: "#FFFFFF" }}
        >
          {headingText}
        </Text>

        {/* Subtitle */}
        <Text
          className="font-jakarta text-base text-center mb-2xl"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          {subtitleText}
        </Text>

        {/* Send a Message button */}
        <Pressable
          className="w-full items-center justify-center py-lg rounded-lg mb-lg"
          style={{ backgroundColor: accentColor }}
          onPress={onSendMessage}
          accessibilityRole="button"
          accessibilityLabel={`Send a message to ${matchedUserName}`}
        >
          <Text className="font-jakarta-semibold text-base" style={{ color: "#FFFFFF" }}>
            Send a Message
          </Text>
        </Pressable>

        {/* Keep Swiping link */}
        <Pressable
          onPress={onKeepSwiping}
          accessibilityRole="button"
          accessibilityLabel="Keep swiping"
          className="py-sm"
        >
          <Text
            className="font-jakarta-medium text-sm text-center"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Keep Swiping
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
