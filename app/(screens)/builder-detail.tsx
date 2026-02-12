import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  MessageCircle,
} from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { usePremium } from "@/hooks/usePremium";
import { useAuthStore } from "@/stores/auth-store";
import VerifiedBadge from "@/components/VerifiedBadge";
import type { BuilderProfile, BuilderReview, Profile } from "@/types/database";
import { format } from "date-fns";

const specialtyIcons: Record<string, string> = {
  electrical: "\u26A1",
  solar: "\u2600\uFE0F",
  woodwork: "\uD83E\uDE9A",
  plumbing: "\uD83D\uDEB0",
  "full builds": "\uD83D\uDE90",
  insulation: "\uD83E\uDDF1",
  mechanical: "\uD83D\uDD27",
};

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.round(rating);
    stars.push(
      <Star
        key={i}
        size={size}
        color="#F06428"
        fill={filled ? "#F06428" : "transparent"}
        strokeWidth={1.5}
      />,
    );
  }
  return <View className="flex-row items-center gap-[1px]">{stars}</View>;
}

interface ReviewItemProps {
  review: BuilderReview;
  reviewerProfile: Profile | null;
}

function ReviewItem({ review, reviewerProfile }: ReviewItemProps) {
  return (
    <View
      className="bg-surface rounded-md p-lg"
      style={{ borderWidth: 1, borderColor: "rgba(28,25,23,0.08)" }}
    >
      <View className="flex-row items-center mb-[6px]">
        {reviewerProfile?.avatar_url ? (
          <Image
            source={{ uri: reviewerProfile.avatar_url }}
            className="w-[32px] h-[32px] rounded-sm mr-[8px]"
            resizeMode="cover"
          />
        ) : (
          <View className="w-[32px] h-[32px] rounded-sm bg-surface-raise items-center justify-center mr-[8px]">
            <Text className="text-ink-tertiary text-[14px]">
              {reviewerProfile?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-ink font-jakarta-semibold text-[14px]">
            {reviewerProfile?.name ?? "Anonymous"}
          </Text>
          <StarRating rating={review.rating} size={12} />
        </View>
        <Text className="text-ink-tertiary font-jakarta text-[12px]">
          {format(new Date(review.created_at), "MMM d, yyyy")}
        </Text>
      </View>
      {review.comment && (
        <Text className="text-ink-secondary font-jakarta text-[14px] leading-[20px]">
          {review.comment}
        </Text>
      )}
    </View>
  );
}

export default function BuilderDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isPremium } = usePremium();
  const { user } = useAuthStore();
  const [builder, setBuilder] = useState<BuilderProfile | null>(null);
  const [reviewerProfiles, setReviewerProfiles] = useState<
    Record<string, Profile>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchBuilder = async () => {
      setLoading(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      const { data: reviews } = await supabase
        .from("builder_reviews")
        .select("*")
        .eq("builder_id", id)
        .order("created_at", { ascending: false });

      const reviewList = (reviews ?? []) as BuilderReview[];
      const totalRating = reviewList.reduce((sum, r) => sum + r.rating, 0);
      const averageRating =
        reviewList.length > 0 ? totalRating / reviewList.length : 0;

      setBuilder({
        ...profile,
        average_rating: averageRating,
        review_count: reviewList.length,
        reviews: reviewList,
      } as BuilderProfile);

      // Fetch reviewer profiles
      const reviewerIds = [
        ...new Set(reviewList.map((r) => r.reviewer_id)),
      ];
      if (reviewerIds.length > 0) {
        const { data: reviewers } = await supabase
          .from("profiles")
          .select("*")
          .in("id", reviewerIds);

        if (reviewers) {
          const map: Record<string, Profile> = {};
          for (const reviewer of reviewers) {
            map[reviewer.id] = reviewer as Profile;
          }
          setReviewerProfiles(map);
        }
      }

      setLoading(false);
    };

    fetchBuilder();
  }, [id]);

  const handleContactBuilder = () => {
    if (!isPremium) {
      router.push("/(screens)/paywall");
      return;
    }
    // In a full implementation, this would create or navigate to a conversation
    router.push(`/(screens)/chat?matchId=builder_${id}`);
  };

  if (loading) {
    return (
      <View
        className="flex-1 bg-canvas items-center justify-center"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#F06428" />
      </View>
    );
  }

  if (!builder) {
    return (
      <View
        className="flex-1 bg-canvas items-center justify-center"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-ink-secondary font-jakarta-medium text-[16px]">
          Builder not found
        </Text>
      </View>
    );
  }

  const specialtyIcon =
    specialtyIcons[builder.builder_specialty?.toLowerCase() ?? ""] ??
    "\uD83D\uDD27";

  const services = builder.builder_description
    ?.split("\n")
    .filter((s) => s.trim()) ?? [];

  const isOwnProfile = user?.id === builder.id;

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
        <Text className="text-ink font-jakarta-semibold text-[17px] flex-1">
          Builder Profile
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Avatar + Name */}
        <View className="items-center px-xl pt-md pb-xl">
          {builder.avatar_url ? (
            <Image
              source={{ uri: builder.avatar_url }}
              className="w-[96px] h-[96px] rounded-lg mb-md"
              resizeMode="cover"
            />
          ) : (
            <View className="w-[96px] h-[96px] rounded-lg bg-surface-raise items-center justify-center mb-md">
              <Text className="text-ink-tertiary text-[36px]">
                {builder.name?.charAt(0)?.toUpperCase() ?? "?"}
              </Text>
            </View>
          )}

          <View className="flex-row items-center mb-[4px]">
            <Text className="text-ink font-jakarta-bold text-[22px]">
              {builder.name}
            </Text>
            {builder.is_verified && <VerifiedBadge size={20} />}
          </View>

          {/* Specialty + Rate */}
          <View className="flex-row items-center mb-[8px]">
            <View className="bg-surface-raise rounded-sm px-md py-[4px] flex-row items-center mr-[8px]">
              <Text className="text-[14px] mr-[4px]">{specialtyIcon}</Text>
              <Text className="text-ink-secondary font-jakarta-semibold text-[14px]">
                {builder.builder_specialty ?? "General"}
              </Text>
            </View>
            {builder.builder_rate && (
              <View className="bg-sunset-soft rounded-sm px-md py-[4px]">
                <Text className="text-sunset font-jakarta-semibold text-[14px]">
                  {builder.builder_rate}
                </Text>
              </View>
            )}
          </View>

          {/* Rating */}
          <View className="flex-row items-center">
            <StarRating rating={builder.average_rating} size={18} />
            <Text className="text-ink-secondary font-jakarta-medium text-[14px] ml-[6px]">
              {builder.average_rating.toFixed(1)}
            </Text>
            <Text className="text-ink-tertiary font-jakarta text-[14px] ml-[2px]">
              ({builder.review_count}{" "}
              {builder.review_count === 1 ? "review" : "reviews"})
            </Text>
          </View>

          {/* Location */}
          {builder.location_name && (
            <View className="flex-row items-center mt-[8px]">
              <MapPin size={14} color="#A8A29E" strokeWidth={1.8} />
              <Text className="text-ink-tertiary font-jakarta text-[14px] ml-[4px]">
                {builder.location_name}
              </Text>
            </View>
          )}
        </View>

        {/* Bio */}
        {builder.bio && (
          <View className="px-xl mb-xl">
            <Text className="text-ink font-jakarta-semibold text-[16px] mb-[6px]">
              About
            </Text>
            <Text className="text-ink-secondary font-jakarta text-[15px] leading-[22px]">
              {builder.bio}
            </Text>
          </View>
        )}

        {/* Services Offered */}
        {services.length > 0 && (
          <View className="px-xl mb-xl">
            <Text className="text-ink font-jakarta-semibold text-[16px] mb-[8px]">
              Services Offered
            </Text>
            {services.map((service, index) => (
              <View
                key={index}
                className="flex-row items-start mb-[6px]"
              >
                <View className="w-[6px] h-[6px] rounded-full bg-sunset mt-[7px] mr-[10px]" />
                <Text className="text-ink-secondary font-jakarta text-[15px] leading-[22px] flex-1">
                  {service.trim()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        {!isOwnProfile && (
          <View className="px-xl mb-xl gap-[10px]">
            <Pressable
              onPress={handleContactBuilder}
              className="bg-sunset rounded-md py-lg flex-row items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Contact builder"
            >
              <MessageCircle
                size={18}
                color="#FFFFFF"
                strokeWidth={1.8}
              />
              <Text className="text-white font-jakarta-semibold text-[16px] ml-[8px]">
                Contact Builder
              </Text>
            </Pressable>
            {!isPremium && (
              <Text className="text-ink-tertiary font-jakarta text-[12px] text-center">
                Premium required to contact builders
              </Text>
            )}
          </View>
        )}

        {/* Reviews */}
        <View className="px-xl">
          <View className="flex-row items-center justify-between mb-[10px]">
            <Text className="text-ink font-jakarta-semibold text-[16px]">
              Reviews
            </Text>
            <Text className="text-ink-tertiary font-jakarta text-[13px]">
              {builder.review_count}{" "}
              {builder.review_count === 1 ? "review" : "reviews"}
            </Text>
          </View>

          {builder.reviews.length === 0 ? (
            <View
              className="bg-surface rounded-md p-xl items-center"
              style={{ borderWidth: 1, borderColor: "rgba(28,25,23,0.08)" }}
            >
              <Text className="text-[28px] mb-[6px]">{"\u2B50"}</Text>
              <Text className="text-ink-tertiary font-jakarta text-[14px]">
                No reviews yet
              </Text>
            </View>
          ) : (
            <View className="gap-[10px]">
              {builder.reviews.map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  reviewerProfile={reviewerProfiles[review.reviewer_id] ?? null}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
