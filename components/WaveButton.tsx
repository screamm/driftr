import { Pressable, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";

interface WaveButtonProps {
  onPress: () => void;
  mode: "dating" | "friends";
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WaveButton({
  onPress,
  mode,
  disabled = false,
}: WaveButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.88, { damping: 12, stiffness: 300 }),
      withSpring(1.12, { damping: 10, stiffness: 250 }),
      withSpring(1, { damping: 14, stiffness: 200 }),
    );
    onPress();
  };

  const isDating = mode === "dating";
  const bgColor = isDating ? "bg-match" : "bg-sunset";
  const emoji = isDating ? "\u2764\uFE0F" : "\uD83D\uDC4B";
  const label = isDating ? "Wave" : "Wave";

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled}
      style={animatedStyle}
      className={`${bgColor} ${disabled ? "opacity-40" : "opacity-100"} rounded-md px-xl py-md flex-row items-center justify-center`}
    >
      <Text className="text-[20px] mr-[6px]">{emoji}</Text>
      <Text className="text-white font-jakarta-semibold text-[15px]">
        {label}
      </Text>
    </AnimatedPressable>
  );
}
