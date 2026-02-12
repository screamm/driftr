import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { X, Check } from "lucide-react-native";
import Purchases from "react-native-purchases";

type PlanType = "monthly" | "annual";

const FEATURES = [
  { icon: "\u267E\uFE0F", label: "Unlimited waves" },
  { icon: "\uD83D\uDD27", label: "Contact builders directly" },
  { icon: "\uD83D\uDC40", label: "See who waved at you" },
  { icon: "\uD83C\uDF0D", label: "Expand search to 250km" },
  { icon: "\uD83C\uDFC5", label: "Premium badge" },
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("annual");
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;

      if (!currentOffering) {
        Alert.alert("Error", "No offerings available. Please try again later.");
        setPurchasing(false);
        return;
      }

      const pkg =
        selectedPlan === "annual"
          ? currentOffering.annual
          : currentOffering.monthly;

      if (!pkg) {
        Alert.alert(
          "Error",
          "Selected plan is not available. Please try again later.",
        );
        setPurchasing(false);
        return;
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg);

      if (customerInfo.entitlements.active["premium"]) {
        router.back();
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert(
          "Purchase Failed",
          "Something went wrong. Please try again.",
        );
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active["premium"]) {
        Alert.alert("Restored", "Your premium subscription has been restored.");
        router.back();
      } else {
        Alert.alert(
          "No Subscription Found",
          "We couldn't find an active subscription to restore.",
        );
      }
    } catch {
      Alert.alert("Error", "Failed to restore purchases. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      {/* Background gradient feel via layered views */}
      <View
        className="absolute top-0 left-0 right-0 h-[280px] bg-sunset-soft"
        style={{ opacity: 0.6 }}
      />

      {/* Close button */}
      <View className="flex-row justify-end px-xl pt-md z-10">
        <Pressable
          onPress={() => router.back()}
          className="w-[36px] h-[36px] rounded-full bg-white/80 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Close paywall"
        >
          <X size={18} color="#1C1917" strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24) + 16,
        }}
      >
        {/* Heading */}
        <View className="items-center px-xl pt-xl pb-2xl">
          <Text className="text-[48px] mb-md">{"\uD83C\uDF1F"}</Text>
          <Text className="text-ink font-jakarta-bold text-[28px] text-center leading-[34px]">
            Go Premium.{"\n"}Meet Everyone.
          </Text>
          <Text className="text-ink-secondary font-jakarta text-[15px] text-center mt-[8px]">
            Unlock the full DRIFTR experience
          </Text>
        </View>

        {/* Features */}
        <View className="px-xl mb-2xl">
          {FEATURES.map((feature, index) => (
            <View
              key={index}
              className="flex-row items-center mb-[14px]"
            >
              <View className="w-[44px] h-[44px] rounded-md bg-surface items-center justify-center mr-md">
                <Text className="text-[20px]">{feature.icon}</Text>
              </View>
              <Text className="text-ink font-jakarta-medium text-[16px] flex-1">
                {feature.label}
              </Text>
              <Check size={18} color="#4D9B6A" strokeWidth={2.5} />
            </View>
          ))}
        </View>

        {/* Pricing options */}
        <View className="px-xl mb-xl">
          {/* Annual — best value */}
          <Pressable
            onPress={() => setSelectedPlan("annual")}
            className={`rounded-lg p-lg mb-[10px] ${
              selectedPlan === "annual" ? "bg-sunset-soft" : "bg-surface"
            }`}
            style={{
              borderWidth: 2,
              borderColor:
                selectedPlan === "annual" ? "#F06428" : "rgba(28,25,23,0.08)",
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedPlan === "annual" }}
            accessibilityLabel="Annual plan, $59.99 per year, save 37%"
          >
            {/* Best value badge */}
            <View className="absolute top-[-10px] right-[16px] bg-sunset rounded-sm px-[10px] py-[2px]">
              <Text className="text-white font-jakarta-semibold text-[11px]">
                BEST VALUE
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-ink font-jakarta-bold text-[17px]">
                  Annual
                </Text>
                <Text className="text-ink-secondary font-jakarta text-[13px] mt-[2px]">
                  7-day free trial included
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-ink font-jakarta-bold text-[18px]">
                  $59.99
                </Text>
                <Text className="text-ink-secondary font-jakarta text-[13px]">
                  $5.00/month
                </Text>
              </View>
            </View>

            <View className="bg-parked-soft rounded-sm px-[8px] py-[3px] self-start mt-[8px]">
              <Text className="text-parked font-jakarta-semibold text-[12px]">
                SAVE 37%
              </Text>
            </View>
          </Pressable>

          {/* Monthly */}
          <Pressable
            onPress={() => setSelectedPlan("monthly")}
            className={`rounded-lg p-lg ${
              selectedPlan === "monthly" ? "bg-sunset-soft" : "bg-surface"
            }`}
            style={{
              borderWidth: 2,
              borderColor:
                selectedPlan === "monthly"
                  ? "#F06428"
                  : "rgba(28,25,23,0.08)",
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedPlan === "monthly" }}
            accessibilityLabel="Monthly plan, $7.99 per month"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-ink font-jakarta-bold text-[17px]">
                  Monthly
                </Text>
                <Text className="text-ink-secondary font-jakarta text-[13px] mt-[2px]">
                  Cancel anytime
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-ink font-jakarta-bold text-[18px]">
                  $7.99
                </Text>
                <Text className="text-ink-secondary font-jakarta text-[13px]">
                  per month
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Purchase button */}
        <View className="px-xl mb-lg">
          <Pressable
            onPress={handlePurchase}
            disabled={purchasing}
            className={`bg-sunset rounded-md py-lg items-center justify-center ${
              purchasing ? "opacity-70" : "opacity-100"
            }`}
            accessibilityRole="button"
            accessibilityLabel={`Subscribe to ${selectedPlan} plan`}
          >
            {purchasing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-jakarta-bold text-[17px]">
                {selectedPlan === "annual"
                  ? "Start Free Trial"
                  : "Subscribe Now"}
              </Text>
            )}
          </Pressable>

          {selectedPlan === "annual" && (
            <Text className="text-ink-tertiary font-jakarta text-[12px] text-center mt-[6px]">
              7-day free trial, then $59.99/year. Cancel anytime.
            </Text>
          )}
        </View>

        {/* Restore purchases */}
        <View className="items-center">
          <Pressable
            onPress={handleRestore}
            disabled={purchasing}
            accessibilityRole="button"
            accessibilityLabel="Restore purchases"
          >
            <Text className="text-ink-tertiary font-jakarta-medium text-[14px] underline">
              Restore Purchases
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
