import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Switch,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowLeft,
  Bell,
  MessageSquare,
  MapPin,
  ChevronRight,
  Shield,
  FileText,
  Trash2,
  LogOut,
} from "lucide-react-native";
import { useAuthStore } from "@/stores/auth-store";
import Constants from "expo-constants";
import { supabase } from "@/lib/supabase";

const PRIVACY_URL = "https://driftr.app/privacy";
const TERMS_URL = "https://driftr.app/terms";

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}

function SettingRow({
  icon,
  label,
  trailing,
  onPress,
  danger = false,
}: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !trailing}
      className="flex-row items-center py-lg"
      accessibilityRole={onPress ? "button" : "none"}
      accessibilityLabel={label}
    >
      <View className="w-[36px] h-[36px] rounded-sm bg-surface-raise items-center justify-center mr-md">
        {icon}
      </View>
      <Text
        className={`flex-1 font-jakarta-medium text-[15px] ${
          danger ? "text-danger" : "text-ink"
        }`}
      >
        {label}
      </Text>
      {trailing ?? (
        onPress ? (
          <ChevronRight size={18} color="#A8A29E" strokeWidth={1.8} />
        ) : null
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, signOut, user } = useAuthStore();
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyNearby, setNotifyNearby] = useState(true);

  const appVersion =
    Constants.expoConfig?.version ?? Constants.manifest?.version ?? "1.0.0";

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone. All your data, matches, and messages will be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            if (!user?.id) return;

            // Call a Supabase edge function or RPC for account deletion
            const { error } = await supabase.rpc("delete_user_account", {
              p_user_id: user.id,
            });

            if (error) {
              Alert.alert(
                "Error",
                "Failed to delete account. Please contact support.",
              );
              return;
            }

            await signOut();
            router.replace("/");
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-xl py-md">
        <Pressable
          onPress={() => router.back()}
          className="w-[40px] h-[40px] rounded-md bg-surface-raise items-center justify-center mr-md"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} color="#1C1917" strokeWidth={1.8} />
        </Pressable>
        <Text className="text-ink font-jakarta-bold text-[22px] flex-1">
          Settings
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24) + 16,
        }}
      >
        {/* Profile section */}
        <View className="px-xl pt-md pb-lg">
          <View className="flex-row items-center">
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                className="w-[60px] h-[60px] rounded-lg mr-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="w-[60px] h-[60px] rounded-lg bg-surface-raise items-center justify-center mr-lg">
                <Text className="text-ink-tertiary text-[24px]">
                  {profile?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-ink font-jakarta-bold text-[18px]">
                {profile?.name ?? "Your Name"}
              </Text>
              <Text className="text-ink-secondary font-jakarta text-[14px]">
                {profile?.location_name ?? "Location unknown"}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View
          className="mx-xl h-[1px] mb-sm"
          style={{ backgroundColor: "rgba(28,25,23,0.08)" }}
        />

        {/* Notifications */}
        <View className="px-xl">
          <Text className="text-ink-tertiary font-jakarta-semibold text-[12px] uppercase tracking-wide mb-sm mt-lg">
            Notifications
          </Text>

          <SettingRow
            icon={
              <Bell size={18} color="#57534E" strokeWidth={1.8} />
            }
            label="New Matches"
            trailing={
              <Switch
                value={notifyMatches}
                onValueChange={setNotifyMatches}
                trackColor={{ false: "#EFECE6", true: "#F06428" }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Toggle new match notifications"
              />
            }
          />
          <SettingRow
            icon={
              <MessageSquare size={18} color="#57534E" strokeWidth={1.8} />
            }
            label="Messages"
            trailing={
              <Switch
                value={notifyMessages}
                onValueChange={setNotifyMessages}
                trackColor={{ false: "#EFECE6", true: "#F06428" }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Toggle message notifications"
              />
            }
          />
          <SettingRow
            icon={
              <MapPin size={18} color="#57534E" strokeWidth={1.8} />
            }
            label="Nearby People"
            trailing={
              <Switch
                value={notifyNearby}
                onValueChange={setNotifyNearby}
                trackColor={{ false: "#EFECE6", true: "#F06428" }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Toggle nearby people notifications"
              />
            }
          />
        </View>

        {/* Divider */}
        <View
          className="mx-xl h-[1px] my-sm"
          style={{ backgroundColor: "rgba(28,25,23,0.08)" }}
        />

        {/* Legal */}
        <View className="px-xl">
          <Text className="text-ink-tertiary font-jakarta-semibold text-[12px] uppercase tracking-wide mb-sm mt-lg">
            Legal
          </Text>

          <SettingRow
            icon={
              <Shield size={18} color="#57534E" strokeWidth={1.8} />
            }
            label="Privacy Policy"
            onPress={() => Linking.openURL(PRIVACY_URL)}
          />
          <SettingRow
            icon={
              <FileText size={18} color="#57534E" strokeWidth={1.8} />
            }
            label="Terms of Service"
            onPress={() => Linking.openURL(TERMS_URL)}
          />
        </View>

        {/* Divider */}
        <View
          className="mx-xl h-[1px] my-sm"
          style={{ backgroundColor: "rgba(28,25,23,0.08)" }}
        />

        {/* Account actions */}
        <View className="px-xl">
          <Text className="text-ink-tertiary font-jakarta-semibold text-[12px] uppercase tracking-wide mb-sm mt-lg">
            Account
          </Text>

          <SettingRow
            icon={
              <Trash2 size={18} color="#C4443A" strokeWidth={1.8} />
            }
            label="Delete Account"
            danger
            onPress={handleDeleteAccount}
          />
        </View>

        {/* Sign out button */}
        <View className="px-xl mt-xl">
          <Pressable
            onPress={handleSignOut}
            className="bg-surface rounded-md py-lg flex-row items-center justify-center"
            style={{ borderWidth: 1, borderColor: "rgba(28,25,23,0.08)" }}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <LogOut size={18} color="#C4443A" strokeWidth={1.8} />
            <Text className="text-danger font-jakarta-semibold text-[15px] ml-[8px]">
              Sign Out
            </Text>
          </Pressable>
        </View>

        {/* App version */}
        <View className="items-center mt-2xl">
          <Text className="text-ink-muted font-jakarta text-[13px]">
            DRIFTR v{appVersion}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
