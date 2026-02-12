import { View, Text, Image, StyleSheet } from "react-native";
import type { UserStatus } from "@/types/database";

interface MapPinProps {
  avatar_url: string | null;
  name: string | null;
  status: UserStatus;
}

const STATUS_COLORS: Record<UserStatus, string> = {
  parked: "#4D9B6A",
  rolling: "#D4912A",
};

export default function MapPin({ avatar_url, name, status }: MapPinProps) {
  const statusColor = STATUS_COLORS[status];

  return (
    <View className="items-center">
      <View
        className="h-11 w-11 rounded-full border-2 border-white"
        style={styles.markerShadow}
      >
        {avatar_url ? (
          <Image
            source={{ uri: avatar_url }}
            className="h-full w-full rounded-full"
          />
        ) : (
          <View className="h-full w-full items-center justify-center rounded-full bg-surface-raise">
            <Text className="font-jakarta-semibold text-sm text-ink-secondary">
              {name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}
      </View>
      {/* Status dot */}
      <View
        className="absolute -bottom-0.5 right-0 h-3.5 w-3.5 rounded-full border-2 border-white"
        style={{ backgroundColor: statusColor }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  markerShadow: {
    shadowColor: "#1C1917",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
