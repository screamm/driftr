import { useState, useRef, useCallback } from "react";
import { View, Pressable, Text } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Play, Pause } from "lucide-react-native";

interface VideoIntroProps {
  uri: string;
}

export default function VideoIntro({ uri }: VideoIntroProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  }, [isPlaying, player]);

  return (
    <View className="rounded-lg overflow-hidden bg-ink">
      <VideoView
        player={player}
        style={{ width: "100%", aspectRatio: 16 / 9 }}
        nativeControls={false}
      />
      <Pressable
        onPress={togglePlayback}
        className="absolute inset-0 items-center justify-center"
      >
        {!isPlaying && (
          <View className="w-[56px] h-[56px] rounded-full bg-white/80 items-center justify-center">
            <Play size={24} color="#1C1917" fill="#1C1917" />
          </View>
        )}
      </Pressable>
      {isPlaying && (
        <Pressable
          onPress={togglePlayback}
          className="absolute bottom-[12px] right-[12px] w-[36px] h-[36px] rounded-full bg-black/40 items-center justify-center"
        >
          <Pause size={16} color="#FFFFFF" fill="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
}
