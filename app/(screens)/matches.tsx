import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useMatchStore } from "@/stores/match-store";
import { format, isToday, isYesterday } from "date-fns";
import type { MatchWithProfile, ConnectionMode } from "@/types/database";

export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

interface MatchItemProps {
  match: MatchWithProfile;
  onPress: () => void;
}

function MatchItem({ match, onPress }: MatchItemProps) {
  const profile = match.other_user;
  const lastMessage = match.last_message;
  const hasUnread = match.unread_count > 0;
  const isOnline = profile.status === "rolling";

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-xl py-md"
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${profile.name}`}
    >
      {/* Avatar with status dot */}
      <View className="mr-md">
        {profile.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            className="w-[52px] h-[52px] rounded-md"
            resizeMode="cover"
          />
        ) : (
          <View className="w-[52px] h-[52px] rounded-md bg-surface-raise items-center justify-center">
            <Text className="text-ink-tertiary text-[20px]">
              {profile.name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}
        {/* Status dot */}
        <View
          className={`absolute bottom-[-2px] right-[-2px] w-[14px] h-[14px] rounded-full border-[2px] border-canvas ${
            isOnline ? "bg-parked" : "bg-ink-tertiary"
          }`}
        />
      </View>

      {/* Info */}
      <View className="flex-1 mr-sm">
        <Text
          className={`text-[15px] mb-[2px] ${
            hasUnread
              ? "text-ink font-jakarta-semibold"
              : "text-ink font-jakarta-medium"
          }`}
          numberOfLines={1}
        >
          {profile.name}
        </Text>
        {lastMessage ? (
          <Text
            className={`text-[13px] ${
              hasUnread
                ? "text-ink-secondary font-jakarta-medium"
                : "text-ink-tertiary font-jakarta"
            }`}
            numberOfLines={1}
          >
            {lastMessage.content}
          </Text>
        ) : (
          <Text className="text-ink-tertiary font-jakarta text-[13px]">
            New match — say hello!
          </Text>
        )}
      </View>

      {/* Timestamp + Unread */}
      <View className="items-end">
        <Text className="text-ink-tertiary font-jakarta text-[12px] mb-[4px]">
          {lastMessage
            ? formatTimestamp(lastMessage.created_at)
            : formatTimestamp(match.created_at)}
        </Text>
        {hasUnread && (
          <View className="bg-sunset rounded-full min-w-[20px] h-[20px] items-center justify-center px-[6px]">
            <Text className="text-white font-jakarta-semibold text-[11px]">
              {match.unread_count > 99 ? "99+" : match.unread_count}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function MatchesScreen() {
  const insets = useSafeAreaInsets();
  const { matches, isLoading, fetchMatches, setActiveChat } = useMatchStore();
  const [activeTab, setActiveTab] = useState<ConnectionMode>("dating");

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const filteredMatches = matches.filter((m) => m.mode === activeTab);

  const handleMatchPress = (match: MatchWithProfile) => {
    setActiveChat(match);
    router.push(`/(screens)/chat?matchId=${match.id}`);
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
          Matches
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-xl mb-lg bg-surface-raise rounded-md p-[3px]">
        <Pressable
          onPress={() => setActiveTab("dating")}
          className={`flex-1 py-[10px] rounded-sm items-center ${
            activeTab === "dating" ? "bg-canvas" : ""
          }`}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "dating" }}
        >
          <Text
            className={`font-jakarta-semibold text-[14px] ${
              activeTab === "dating" ? "text-match" : "text-ink-tertiary"
            }`}
          >
            {"\u2764\uFE0F"} Dating
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("friends")}
          className={`flex-1 py-[10px] rounded-sm items-center ${
            activeTab === "friends" ? "bg-canvas" : ""
          }`}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "friends" }}
        >
          <Text
            className={`font-jakarta-semibold text-[14px] ${
              activeTab === "friends" ? "text-sunset" : "text-ink-tertiary"
            }`}
          >
            {"\uD83E\uDD1D"} Friends
          </Text>
        </Pressable>
      </View>

      {/* Match List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F06428" />
        </View>
      ) : filteredMatches.length === 0 ? (
        <View className="flex-1 items-center justify-center px-xl">
          <Text className="text-[40px] mb-md">
            {activeTab === "dating" ? "\u2764\uFE0F" : "\uD83D\uDC4B"}
          </Text>
          <Text className="text-ink-secondary font-jakarta-medium text-[16px] text-center">
            No {activeTab === "dating" ? "dating" : "friend"} matches yet
          </Text>
          <Text className="text-ink-tertiary font-jakarta text-[14px] text-center mt-[4px]">
            Start waving at people nearby to match!
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          ItemSeparatorComponent={() => (
            <View
              className="mx-xl h-[1px]"
              style={{ backgroundColor: "rgba(28,25,23,0.08)" }}
            />
          )}
          renderItem={({ item }) => (
            <MatchItem
              match={item}
              onPress={() => handleMatchPress(item)}
            />
          )}
        />
      )}
    </View>
  );
}
