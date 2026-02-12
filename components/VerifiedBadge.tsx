import { View } from "react-native";
import { BadgeCheck } from "lucide-react-native";

interface VerifiedBadgeProps {
  size?: number;
}

export default function VerifiedBadge({ size = 18 }: VerifiedBadgeProps) {
  return (
    <View className="ml-[4px]">
      <BadgeCheck size={size} color="#3B82F6" fill="#3B82F6" strokeWidth={0} />
    </View>
  );
}
