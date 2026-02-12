import { View, Text } from "react-native";

interface StatusBadgeProps {
  status: "parked" | "rolling";
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const isParked = status === "parked";

  const dotSize = size === "sm" ? "w-[6px] h-[6px]" : "w-[8px] h-[8px]";
  const textSize = size === "sm" ? "text-[11px]" : "text-[13px]";
  const paddingX = size === "sm" ? "px-[8px]" : "px-[10px]";
  const paddingY = size === "sm" ? "py-[3px]" : "py-[5px]";

  const bgColor = isParked ? "bg-parked-soft" : "bg-rolling-soft";
  const dotColor = isParked ? "bg-parked" : "bg-rolling";
  const textColor = isParked ? "text-parked" : "text-rolling";
  const label = isParked ? "Parked" : "Rolling";

  return (
    <View
      className={`flex-row items-center ${bgColor} ${paddingX} ${paddingY} rounded-sm self-start`}
    >
      <View className={`${dotSize} rounded-full ${dotColor} mr-[6px]`} />
      <Text
        className={`${textColor} ${textSize} font-jakarta-semibold`}
      >
        {label}
      </Text>
    </View>
  );
}
