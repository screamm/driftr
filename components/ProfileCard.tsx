import { View, Text, Pressable, Image } from "react-native";
import StatusBadge from "./StatusBadge";
import VerifiedBadge from "./VerifiedBadge";
import type { Profile } from "@/types/database";

interface ProfileCardProps {
  profile: Profile;
  onPress: () => void;
  onWave: () => void;
}

export default function ProfileCard({
  profile,
  onPress,
  onWave,
}: ProfileCardProps) {
  const vanLabels: Record<string, string> = {
    campervan: "Campervan",
    skoolie: "Skoolie",
    sprinter: "Sprinter",
    rv: "RV",
    car: "Car",
    truck: "Truck",
    other: "Other",
  };

  return (
    <Pressable
      onPress={onPress}
      className="bg-surface rounded-lg p-lg flex-row items-center"
      style={{ borderWidth: 1, borderColor: "rgba(28,25,23,0.08)" }}
    >
      <View className="mr-md">
        {profile.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            className="w-[56px] h-[56px] rounded-md"
            resizeMode="cover"
          />
        ) : (
          <View className="w-[56px] h-[56px] rounded-md bg-surface-raise items-center justify-center">
            <Text className="text-ink-tertiary text-[22px]">
              {profile.name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-1 mr-sm">
        <View className="flex-row items-center mb-[2px]">
          <Text
            className="text-ink font-jakarta-semibold text-[15px]"
            numberOfLines={1}
          >
            {profile.name}
          </Text>
          {profile.is_verified && <VerifiedBadge size={14} />}
          {profile.age && (
            <Text className="text-ink-secondary font-jakarta text-[13px] ml-[4px]">
              , {profile.age}
            </Text>
          )}
        </View>

        <View className="flex-row items-center gap-[6px]">
          <StatusBadge status={profile.status} size="sm" />
          {profile.van_type && (
            <Text className="text-ink-tertiary font-jakarta text-[12px]">
              {vanLabels[profile.van_type] ?? profile.van_type}
            </Text>
          )}
        </View>
      </View>

      <Pressable
        onPress={onWave}
        className="bg-sunset rounded-md px-md py-sm"
      >
        <Text className="text-[18px]">{"\uD83D\uDC4B"}</Text>
      </Pressable>
    </Pressable>
  );
}
