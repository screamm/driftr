import { useState, useEffect } from "react";
import Purchases, { CustomerInfo } from "react-native-purchases";
import { Platform } from "react-native";
import Constants from "expo-constants";

const ENTITLEMENT_ID = "premium";

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isExpoGo = Constants.appOwnership === "expo";
    if (isExpoGo) {
      setLoading(false);
      return;
    }

    const checkPremium = async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        setIsPremium(
          customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined,
        );
      } catch {
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };

    checkPremium();

    const listener = (info: CustomerInfo) => {
      setIsPremium(info.entitlements.active[ENTITLEMENT_ID] !== undefined);
    };

    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  return { isPremium, loading };
}

export async function initRevenueCat(userId: string) {
  const isExpoGo = Constants.appOwnership === "expo";
  if (isExpoGo) return;

  const apiKey =
    Platform.OS === "ios"
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!;

  Purchases.configure({ apiKey });
  await Purchases.logIn(userId);
}
