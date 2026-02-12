import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useVideoPlayer, VideoView } from "expo-video";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";

const MAX_VIDEO_DURATION = 15;

export default function PhotoScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuthStore();

  // Photo state
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [pendingPhotoUri, setPendingPhotoUri] = useState<string | null>(null);
  const [photoPreviewVisible, setPhotoPreviewVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Video recording state
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(MAX_VIDEO_DURATION);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoPreviewVisible, setVideoPreviewVisible] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploaded, setVideoUploaded] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Video player for preview
  const videoPlayer = useVideoPlayer(videoUri ?? "", (player) => {
    player.loop = true;
  });

  // Clean up countdown timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // --- Photo functions (preserved from original) ---

  async function pickImage(useCamera: boolean) {
    const permissionMethod = useCamera
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;

    const { status } = await permissionMethod();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        `Please allow access to your ${useCamera ? "camera" : "photo library"} to continue.`
      );
      return;
    }

    const launchMethod = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    const result = await launchMethod({
      mediaTypes: ["images"],
      allowsEditing: Platform.OS === "ios",
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (Platform.OS === "ios") {
        // iOS crop UI works fine — use directly
        setAvatarUri(result.assets[0].uri);
        setError(null);
      } else {
        // Android: show custom preview with confirm button
        setPendingPhotoUri(result.assets[0].uri);
        setPhotoPreviewVisible(true);
      }
    }
  }

  function handleConfirmPhoto() {
    if (pendingPhotoUri) {
      setAvatarUri(pendingPhotoUri);
      setPendingPhotoUri(null);
      setPhotoPreviewVisible(false);
      setError(null);
    }
  }

  function handleRetakePhoto() {
    setPendingPhotoUri(null);
    setPhotoPreviewVisible(false);
  }

  async function uploadAvatar(): Promise<string | null> {
    if (!avatarUri || !user) {
      console.error("uploadAvatar: missing", { avatarUri: !!avatarUri, user: !!user });
      return null;
    }

    setIsUploading(true);

    try {
      const fileExt = avatarUri.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${user.id}/avatar.${fileExt}`;

      const response = await fetch(avatarUri);
      const blob = await response.blob();

      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, arrayBuffer, {
          contentType: `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.error("Avatar upload error:", uploadError.message);
        Alert.alert("Upload failed", uploadError.message);
        return null;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.error("Avatar upload exception:", err);
      Alert.alert("Upload failed", "Could not upload photo. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  // --- Video recording functions ---

  async function openCameraModal() {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera permission needed",
          "Please allow camera access to record a video intro."
        );
        return;
      }
    }

    setCameraModalVisible(true);
  }

  function closeCameraModal() {
    if (isRecording) {
      stopRecording();
    }
    setCameraModalVisible(false);
    setCountdown(MAX_VIDEO_DURATION);
  }

  async function startRecording() {
    if (!cameraRef.current || isRecording) return;

    setIsRecording(true);
    setCountdown(MAX_VIDEO_DURATION);

    // Start countdown timer
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Timer reached zero -- stop recording
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: MAX_VIDEO_DURATION,
      });

      if (video?.uri) {
        setVideoUri(video.uri);
        setCameraModalVisible(false);
        setVideoPreviewVisible(true);
      }
    } catch (err) {
      // Recording was likely stopped or cancelled
      console.warn("Recording error:", err);
    } finally {
      setIsRecording(false);
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    }
  }

  function stopRecording() {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  }

  function handleRetake() {
    setVideoUri(null);
    setVideoPreviewVisible(false);
    setCountdown(MAX_VIDEO_DURATION);
    setCameraModalVisible(true);
  }

  async function handleUseVideo() {
    if (!videoUri || !user) return;

    setIsUploadingVideo(true);

    try {
      const filePath = `${user.id}/intro.mp4`;

      const response = await fetch(videoUri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(filePath, arrayBuffer, {
          contentType: "video/mp4",
          upsert: true,
        });

      if (uploadError) {
        Alert.alert("Upload failed", "Could not upload video. Please try again.");
        setIsUploadingVideo(false);
        return;
      }

      const { data } = supabase.storage.from("videos").getPublicUrl(filePath);

      await updateProfile({
        video_intro_url: data.publicUrl,
        is_verified: true,
      });

      setVideoUploaded(true);
      setVideoPreviewVisible(false);
    } catch (err) {
      Alert.alert("Error", "Something went wrong uploading your video.");
    } finally {
      setIsUploadingVideo(false);
    }
  }

  // --- Continue handler ---

  async function handleContinue() {
    if (!avatarUri) {
      Alert.alert("Missing photo", "Please add a profile photo.");
      return;
    }

    if (!user) {
      Alert.alert("Not signed in", "No authenticated user found. Please go back and sign in.");
      console.error("handleContinue: user is null", { session: !!useAuthStore.getState().session });
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const publicUrl = await uploadAvatar();
      if (publicUrl) {
        await updateProfile({ avatar_url: publicUrl });
        router.push("/(onboarding)/looking-for");
      }
    } catch (err) {
      console.error("handleContinue error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // --- Render ---

  return (
    <>
      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="flex-1 px-xl pt-2xl">
          {/* Header */}
          <Text className="font-jakarta-bold text-3xl text-ink mb-sm">
            Show yourself
          </Text>
          <Text className="font-jakarta text-base text-ink-secondary mb-2xl">
            Add a photo so others can recognize you on the road
          </Text>

          {/* Photo Placeholder / Preview */}
          <View className="items-center mb-2xl">
            <Pressable
              onPress={() => pickImage(false)}
              className="w-48 h-48 rounded-full bg-surface-raise border-2 border-dashed border-ink/8 items-center justify-center overflow-hidden"
              accessibilityRole="button"
              accessibilityLabel={
                avatarUri ? "Change profile photo" : "Add profile photo"
              }
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  className="w-48 h-48 rounded-full"
                  accessibilityLabel="Profile photo preview"
                />
              ) : (
                <View className="items-center">
                  <Text className="text-4xl mb-sm">📷</Text>
                  <Text className="font-jakarta-medium text-sm text-ink-tertiary">
                    Add photo
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Photo action buttons */}
          <View className="flex-row gap-sm mb-2xl">
            <Pressable
              className="flex-1 py-md px-lg rounded-sm border border-ink/8 bg-surface-raise items-center"
              onPress={() => pickImage(true)}
              accessibilityRole="button"
              accessibilityLabel="Take a photo"
            >
              <Text className="font-jakarta-medium text-sm text-ink">
                📸 Take Photo
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 py-md px-lg rounded-sm border border-ink/8 bg-surface-raise items-center"
              onPress={() => pickImage(false)}
              accessibilityRole="button"
              accessibilityLabel="Choose from library"
            >
              <Text className="font-jakarta-medium text-sm text-ink">
                🖼️ From Library
              </Text>
            </Pressable>
          </View>

          {/* Video intro section */}
          <View className="bg-surface rounded-md p-xl mb-2xl border border-ink/8">
            <Text className="font-jakarta-semibold text-base text-ink mb-xs">
              Record a 15-second intro
            </Text>
            <Text className="font-jakarta text-sm text-ink-secondary mb-lg">
              Video intros help you stand out and make real connections. You can
              add this later from your profile.
            </Text>

            {videoUploaded ? (
              <View className="flex-row items-center justify-center py-md rounded-sm bg-parked/10 border border-parked/20">
                <Text className="font-jakarta-medium text-sm text-parked">
                  Video intro uploaded -- you are verified!
                </Text>
              </View>
            ) : (
              <Pressable
                className="flex-row items-center justify-center py-md rounded-sm border border-ink/8 bg-surface-raise"
                onPress={openCameraModal}
                accessibilityRole="button"
                accessibilityLabel="Record video intro"
              >
                <Text className="font-jakarta-medium text-sm text-ink-secondary">
                  🎬 Record Video Intro
                </Text>
              </Pressable>
            )}
          </View>

          {(isUploading || isUploadingVideo) && (
            <View className="flex-row items-center justify-center gap-sm mb-lg">
              <ActivityIndicator size="small" color="#F06428" />
              <Text className="font-jakarta text-sm text-ink-secondary">
                {isUploadingVideo ? "Uploading video..." : "Uploading photo..."}
              </Text>
            </View>
          )}

          {error && (
            <Text className="font-jakarta text-sm text-danger mb-lg" role="alert">
              {error}
            </Text>
          )}

          {/* Continue button */}
          <View className="flex-1 justify-end">
            <Pressable
              className={`w-full py-4 px-6 rounded-sm items-center ${
                isLoading || isUploading
                  ? "bg-sunset/70"
                  : "bg-sunset active:bg-sunset-hover"
              }`}
              onPress={handleContinue}
              disabled={isLoading || isUploading}
              accessibilityRole="button"
              accessibilityLabel="Continue"
              accessibilityState={{ disabled: isLoading || isUploading }}
            >
              <Text className="font-jakarta-bold text-lg text-white">
                Continue
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Camera Recording Modal */}
      <Modal
        visible={cameraModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        supportedOrientations={["portrait"]}
        onRequestClose={closeCameraModal}
      >
        <View className="flex-1 bg-black">
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="front"
            mode="video"
          >
            {/* Top bar with close button and timer */}
            <View
              className="flex-row items-center justify-between px-xl"
              style={{ paddingTop: insets.top + 8 }}
            >
              <Pressable
                onPress={closeCameraModal}
                className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="Close camera"
              >
                <Text className="text-white text-lg font-jakarta-bold">X</Text>
              </Pressable>

              {isRecording && (
                <View className="flex-row items-center bg-black/50 rounded-full px-lg py-sm">
                  <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                  <Text className="font-jakarta-bold text-xl text-white">
                    {countdown}s
                  </Text>
                </View>
              )}

              {/* Spacer for centering the timer */}
              <View className="w-10" />
            </View>

            {/* Bottom bar with record button */}
            <View
              className="absolute bottom-0 left-0 right-0 items-center"
              style={{ paddingBottom: insets.bottom + 24 }}
            >
              {!isRecording && (
                <Text className="font-jakarta-medium text-sm text-white mb-lg">
                  Tap to start recording
                </Text>
              )}
              {isRecording && (
                <Text className="font-jakarta-medium text-sm text-white mb-lg">
                  Tap to stop recording
                </Text>
              )}

              <Pressable
                onPress={isRecording ? stopRecording : startRecording}
                className="items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel={
                  isRecording ? "Stop recording" : "Start recording"
                }
              >
                {/* Outer ring */}
                <View className="w-20 h-20 rounded-full border-4 border-white items-center justify-center">
                  {/* Inner circle -- full red when idle, smaller square when recording */}
                  {isRecording ? (
                    <View className="w-8 h-8 rounded-sm bg-red-500" />
                  ) : (
                    <View className="w-16 h-16 rounded-full bg-red-500" />
                  )}
                </View>
              </Pressable>
            </View>
          </CameraView>
        </View>
      </Modal>

      {/* Photo Preview Modal (Android) */}
      <Modal
        visible={photoPreviewVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        supportedOrientations={["portrait"]}
        onRequestClose={handleRetakePhoto}
      >
        <View className="flex-1 bg-black items-center justify-center">
          {pendingPhotoUri && (
            <Image
              source={{ uri: pendingPhotoUri }}
              className="w-80 h-80 rounded-full"
              resizeMode="cover"
              accessibilityLabel="Photo preview"
            />
          )}

          <View
            className="absolute bottom-0 left-0 right-0 px-xl"
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            <View className="flex-row gap-sm">
              <Pressable
                className="flex-1 py-4 rounded-sm items-center bg-white/20 border border-white/30"
                onPress={handleRetakePhoto}
                accessibilityRole="button"
                accessibilityLabel="Choose another photo"
              >
                <Text className="font-jakarta-bold text-base text-white">
                  Retake
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 py-4 rounded-sm items-center bg-sunset"
                onPress={handleConfirmPhoto}
                accessibilityRole="button"
                accessibilityLabel="Use this photo"
              >
                <Text className="font-jakarta-bold text-base text-white">
                  Use This
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Video Preview Modal */}
      <Modal
        visible={videoPreviewVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        supportedOrientations={["portrait"]}
        onRequestClose={() => {
          setVideoPreviewVisible(false);
          setVideoUri(null);
        }}
      >
        <View className="flex-1 bg-black">
          {/* Video playback */}
          {videoUri && (
            <VideoView
              player={videoPlayer}
              style={{ flex: 1 }}
              contentFit="cover"
              nativeControls={false}
            />
          )}

          {/* Top bar */}
          <View
            className="absolute top-0 left-0 right-0 px-xl"
            style={{ paddingTop: insets.top + 8 }}
          >
            <Text className="font-jakarta-bold text-lg text-white text-center">
              Preview
            </Text>
          </View>

          {/* Bottom action buttons */}
          <View
            className="absolute bottom-0 left-0 right-0 px-xl"
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            {isUploadingVideo ? (
              <View className="flex-row items-center justify-center py-lg">
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text className="font-jakarta-medium text-base text-white ml-3">
                  Uploading video...
                </Text>
              </View>
            ) : (
              <View className="flex-row gap-sm">
                <Pressable
                  className="flex-1 py-4 rounded-sm items-center bg-white/20 border border-white/30"
                  onPress={handleRetake}
                  accessibilityRole="button"
                  accessibilityLabel="Retake video"
                >
                  <Text className="font-jakarta-bold text-base text-white">
                    Retake
                  </Text>
                </Pressable>
                <Pressable
                  className="flex-1 py-4 rounded-sm items-center bg-sunset"
                  onPress={handleUseVideo}
                  accessibilityRole="button"
                  accessibilityLabel="Use this video"
                >
                  <Text className="font-jakarta-bold text-base text-white">
                    Use This
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
