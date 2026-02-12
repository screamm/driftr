import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import { useMatchStore } from "@/stores/match-store";
import { useAuthStore } from "@/stores/auth-store";
import ChatBubble from "@/components/ChatBubble";
import type { Message } from "@/types/database";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { user } = useAuthStore();
  const {
    activeChat,
    messages,
    fetchMessages,
    sendMessage,
    subscribeToMessages,
  } = useMatchStore();
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);

  const otherUser = activeChat?.other_user;

  useEffect(() => {
    if (!matchId) return;

    fetchMessages(matchId);
    const unsubscribe = subscribeToMessages(matchId);

    return () => {
      unsubscribe();
    };
  }, [matchId, fetchMessages, subscribeToMessages]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !matchId || sending) return;

    setSending(true);
    setInputText("");
    await sendMessage(matchId, trimmed);
    setSending(false);
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View
        className="flex-row items-center px-xl py-md"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "rgba(28,25,23,0.08)",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-[40px] h-[40px] rounded-md bg-surface-raise items-center justify-center mr-md"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} color="#1C1917" strokeWidth={1.8} />
        </Pressable>

        {otherUser ? (
          <Pressable
            onPress={() =>
              router.push(`/(screens)/user-profile?id=${otherUser.id}`)
            }
            className="flex-row items-center flex-1"
            accessibilityRole="button"
            accessibilityLabel={`View ${otherUser.name}'s profile`}
          >
            {otherUser.avatar_url ? (
              <Image
                source={{ uri: otherUser.avatar_url }}
                className="w-[36px] h-[36px] rounded-sm mr-[8px]"
                resizeMode="cover"
              />
            ) : (
              <View className="w-[36px] h-[36px] rounded-sm bg-surface-raise items-center justify-center mr-[8px]">
                <Text className="text-ink-tertiary text-[16px]">
                  {otherUser.name?.charAt(0)?.toUpperCase() ?? "?"}
                </Text>
              </View>
            )}
            <View>
              <Text className="text-ink font-jakarta-semibold text-[16px]">
                {otherUser.name}
              </Text>
              <Text className="text-ink-tertiary font-jakarta text-[12px]">
                {otherUser.status === "rolling" ? "On the road" : "Parked up"}
              </Text>
            </View>
          </Pressable>
        ) : (
          <Text className="text-ink font-jakarta-semibold text-[16px] flex-1">
            Chat
          </Text>
        )}
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          <View className="flex-1 items-center justify-center px-xl">
            <Text className="text-[36px] mb-md">{"\uD83D\uDC4B"}</Text>
            <Text className="text-ink-secondary font-jakarta-medium text-[15px] text-center">
              Start the conversation
            </Text>
            <Text className="text-ink-tertiary font-jakarta text-[13px] text-center mt-[4px]">
              Say hello to {otherUser?.name ?? "your match"}!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            inverted
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: "column-reverse",
              paddingHorizontal: 24,
              paddingVertical: 16,
            }}
            renderItem={({ item }) => (
              <ChatBubble
                message={item}
                isOwn={item.sender_id === user?.id}
              />
            )}
          />
        )}

        {/* Input bar */}
        <View
          className="flex-row items-end px-xl py-md bg-canvas"
          style={{
            borderTopWidth: 1,
            borderTopColor: "rgba(28,25,23,0.08)",
            paddingBottom: Math.max(insets.bottom, 12),
          }}
        >
          <View className="flex-1 bg-surface-raise rounded-md px-lg py-[10px] mr-[8px] max-h-[120px]">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#A8A29E"
              className="text-ink font-jakarta text-[15px]"
              style={{ padding: 0, maxHeight: 96 }}
              multiline
              autoCorrect
              accessibilityLabel="Message input"
            />
          </View>
          <Pressable
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
            className={`w-[44px] h-[44px] rounded-md items-center justify-center ${
              inputText.trim() ? "bg-sunset" : "bg-surface-raise"
            }`}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send
                size={18}
                color={inputText.trim() ? "#FFFFFF" : "#A8A29E"}
                strokeWidth={1.8}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
