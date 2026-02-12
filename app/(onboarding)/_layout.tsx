import { View } from "react-native";
import { Stack, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STEPS = [
  "/(onboarding)/basics",
  "/(onboarding)/van-life",
  "/(onboarding)/photo",
  "/(onboarding)/looking-for",
  "/(onboarding)/location",
];

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <View className="flex-row gap-xs px-xl">
      {STEPS.map((_, index) => (
        <View
          key={index}
          className={`flex-1 h-1 rounded-sm ${
            index <= currentStep ? "bg-sunset" : "bg-surface"
          }`}
        />
      ))}
    </View>
  );
}

export default function OnboardingLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const currentStep = STEPS.findIndex((step) =>
    pathname.endsWith(step.split("/").pop()!)
  );

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 12 }}>
      <ProgressBar currentStep={currentStep === -1 ? 0 : currentStep} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FAF8F5" },
          animation: "slide_from_right",
        }}
      />
    </View>
  );
}
