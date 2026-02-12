import { View, Text, Pressable, Image } from "react-native";
import { Star, MapPin } from "lucide-react-native";
import VerifiedBadge from "./VerifiedBadge";
import type { BuilderProfile } from "@/types/database";

interface BuilderCardProps {
  builder: BuilderProfile;
  onPress: () => void;
}

const specialtyIcons: Record<string, string> = {
  electrical: "\u26A1",
  solar: "\u2600\uFE0F",
  woodwork: "\uD83E\uDE9A",
  plumbing: "\uD83D\uDEB0",
  "full builds": "\uD83D\uDE90",
  insulation: "\uD83E\uDDF1",
  mechanical: "\uD83D\uDD27",
};

function getSpecialtyIcon(specialty: string | null): string {
  if (!specialty) return "\uD83D\uDD27";
  const key = specialty.toLowerCase();
  return specialtyIcons[key] ?? "\uD83D\uDD27";
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.round(rating);
    stars.push(
      <Star
        key={i}
        size={size}
        color="#F06428"
        fill={filled ? "#F06428" : "transparent"}
        strokeWidth={1.5}
      />,
    );
  }
  return <View className="flex-row items-center gap-[1px]">{stars}</View>;
}

export default function BuilderCard({ builder, onPress }: BuilderCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-surface rounded-lg p-lg flex-row"
      style={{ borderWidth: 1, borderColor: "rgba(28,25,23,0.08)" }}
    >
      <View className="mr-md">
        {builder.avatar_url ? (
          <Image
            source={{ uri: builder.avatar_url }}
            className="w-[52px] h-[52px] rounded-md"
            resizeMode="cover"
          />
        ) : (
          <View className="w-[52px] h-[52px] rounded-md bg-surface-raise items-center justify-center">
            <Text className="text-ink-tertiary text-[20px]">
              {builder.name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center mb-[2px]">
          <Text
            className="text-ink font-jakarta-semibold text-[15px]"
            numberOfLines={1}
          >
            {builder.name}
          </Text>
          {builder.is_verified && <VerifiedBadge size={14} />}
        </View>

        <View className="flex-row items-center mb-[4px]">
          {builder.builder_specialty && (
            <View className="bg-surface-raise rounded-sm px-[8px] py-[2px] flex-row items-center mr-[8px]">
              <Text className="text-[12px] mr-[3px]">
                {getSpecialtyIcon(builder.builder_specialty)}
              </Text>
              <Text className="text-ink-secondary font-jakarta-medium text-[12px]">
                {builder.builder_specialty}
              </Text>
            </View>
          )}
          {builder.builder_rate && (
            <Text className="text-ink-secondary font-jakarta-medium text-[13px]">
              {builder.builder_rate}
            </Text>
          )}
        </View>

        <View className="flex-row items-center">
          <StarRating rating={builder.average_rating} size={13} />
          <Text className="text-ink-tertiary font-jakarta text-[12px] ml-[4px]">
            ({builder.review_count})
          </Text>
          {builder.location_name && (
            <View className="flex-row items-center ml-[8px]">
              <MapPin size={11} color="#A8A29E" strokeWidth={1.8} />
              <Text
                className="text-ink-tertiary font-jakarta text-[12px] ml-[2px]"
                numberOfLines={1}
              >
                {builder.location_name}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
