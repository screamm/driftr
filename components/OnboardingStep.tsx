import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface OnboardingStepProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  step: number;
  totalSteps: number;
}

export default function OnboardingStep({
  children,
  title,
  subtitle,
  step,
  totalSteps,
}: OnboardingStepProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-canvas px-xl"
      style={{ paddingTop: insets.top + 16 }}
    >
      {/* Progress indicator */}
      <View className="flex-row gap-[6px] mb-2xl">
        {Array.from({ length: totalSteps }, (_, i) => (
          <View
            key={i}
            className={`flex-1 h-[3px] rounded-full ${
              i < step ? "bg-sunset" : i === step ? "bg-sunset" : "bg-surface-raise"
            }`}
          />
        ))}
      </View>

      {/* Step label */}
      <Text className="text-ink-tertiary font-jakarta-medium text-[13px] mb-[4px]">
        Step {step + 1} of {totalSteps}
      </Text>

      {/* Title */}
      <Text className="text-ink font-jakarta-bold text-[26px] leading-[32px] mb-[6px]">
        {title}
      </Text>

      {/* Subtitle */}
      <Text className="text-ink-secondary font-jakarta text-[15px] leading-[22px] mb-xl">
        {subtitle}
      </Text>

      {/* Content */}
      <View className="flex-1">{children}</View>
    </View>
  );
}
