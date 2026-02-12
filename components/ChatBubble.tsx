import { View, Text } from "react-native";
import { format } from "date-fns";
import type { Message } from "@/types/database";

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const timestamp = format(new Date(message.created_at), "HH:mm");

  return (
    <View
      className={`mb-[6px] max-w-[78%] ${isOwn ? "self-end" : "self-start"}`}
    >
      <View
        className={`px-lg py-md rounded-lg ${
          isOwn ? "bg-sunset rounded-br-[4px]" : "bg-surface-raise rounded-bl-[4px]"
        }`}
      >
        <Text
          className={`text-[15px] font-jakarta leading-[21px] ${
            isOwn ? "text-white" : "text-ink"
          }`}
        >
          {message.content}
        </Text>
      </View>
      <Text
        className={`text-[11px] font-jakarta text-ink-tertiary mt-[2px] ${
          isOwn ? "text-right" : "text-left"
        }`}
      >
        {timestamp}
      </Text>
    </View>
  );
}
