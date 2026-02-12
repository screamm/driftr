import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Search } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import BuilderCard from "@/components/BuilderCard";
import type { BuilderProfile, BuilderReview } from "@/types/database";

const FILTER_CHIPS = [
  "All",
  "Electrical",
  "Solar",
  "Woodwork",
  "Plumbing",
  "Full Builds",
] as const;

type FilterChip = (typeof FILTER_CHIPS)[number];

export default function BuildersScreen() {
  const insets = useSafeAreaInsets();
  const [builders, setBuilders] = useState<BuilderProfile[]>([]);
  const [filteredBuilders, setFilteredBuilders] = useState<BuilderProfile[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterChip>("All");

  const fetchBuilders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: profiles, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_builder", true);

      if (fetchError) throw fetchError;
      if (!profiles) return;

      const buildersWithReviews: BuilderProfile[] = await Promise.all(
        profiles.map(async (profile) => {
          const { data: reviews } = await supabase
            .from("builder_reviews")
            .select("*")
            .eq("builder_id", profile.id)
            .order("created_at", { ascending: false });

          const reviewList = (reviews ?? []) as BuilderReview[];
          const totalRating = reviewList.reduce((sum, r) => sum + r.rating, 0);
          const averageRating =
            reviewList.length > 0 ? totalRating / reviewList.length : 0;

          return {
            ...profile,
            average_rating: averageRating,
            review_count: reviewList.length,
            reviews: reviewList,
          } as BuilderProfile;
        }),
      );

      setBuilders(buildersWithReviews);
      setFilteredBuilders(buildersWithReviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load builders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuilders();
  }, [fetchBuilders]);

  useEffect(() => {
    let result = builders;

    if (activeFilter !== "All") {
      result = result.filter(
        (b) =>
          b.builder_specialty?.toLowerCase() === activeFilter.toLowerCase(),
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name?.toLowerCase().includes(query) ||
          b.builder_specialty?.toLowerCase().includes(query) ||
          b.location_name?.toLowerCase().includes(query),
      );
    }

    setFilteredBuilders(result);
  }, [activeFilter, searchQuery, builders]);

  const handleBuilderPress = (builderId: string) => {
    router.push(`/(screens)/builder-detail?id=${builderId}`);
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-xl pt-lg pb-md">
        <Text className="text-ink font-jakarta-bold text-[24px]">
          Builder Help
        </Text>
        <Text className="text-ink-secondary font-jakarta text-[14px] mt-[2px]">
          Find skilled builders for your van project
        </Text>
      </View>

      {/* Search bar */}
      <View className="px-xl mb-md">
        <View className="bg-surface-raise rounded-sm flex-row items-center px-md py-[10px]">
          <Search size={18} color="#A8A29E" strokeWidth={1.8} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search builders..."
            placeholderTextColor="#A8A29E"
            className="flex-1 ml-[8px] text-ink font-jakarta text-[15px]"
            style={{ padding: 0 }}
            autoCorrect={false}
            accessibilityLabel="Search builders"
            accessibilityRole="search"
          />
        </View>
      </View>

      {/* Filter chips */}
      <View className="mb-md">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_CHIPS}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          ItemSeparatorComponent={() => <View className="w-[8px]" />}
          renderItem={({ item }) => {
            const isActive = activeFilter === item;
            return (
              <Pressable
                onPress={() => setActiveFilter(item)}
                className={`px-lg py-sm rounded-sm ${
                  isActive ? "bg-sunset" : "bg-surface-raise"
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Filter by ${item}`}
              >
                <Text
                  className={`font-jakarta-medium text-[13px] ${
                    isActive ? "text-white" : "text-ink-secondary"
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Builder list */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F06428" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-xl">
          <Text className="text-[40px] mb-md">{"\u26A0\uFE0F"}</Text>
          <Text className="text-ink-secondary font-jakarta-medium text-[16px] text-center">
            Something went wrong
          </Text>
          <Text className="text-ink-tertiary font-jakarta text-[14px] text-center mt-[4px]">
            {error}
          </Text>
          <Pressable
            onPress={fetchBuilders}
            className="mt-lg bg-sunset rounded-sm px-xl py-md"
            accessibilityRole="button"
            accessibilityLabel="Retry loading builders"
          >
            <Text className="text-white font-jakarta-semibold text-[14px]">
              Try Again
            </Text>
          </Pressable>
        </View>
      ) : filteredBuilders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-xl">
          <Text className="text-[40px] mb-md">{"\uD83D\uDD27"}</Text>
          <Text className="text-ink-secondary font-jakarta-medium text-[16px] text-center">
            No builders found
          </Text>
          <Text className="text-ink-tertiary font-jakarta text-[14px] text-center mt-[4px]">
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBuilders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
          ItemSeparatorComponent={() => <View className="h-[10px]" />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <BuilderCard
              builder={item}
              onPress={() => handleBuilderPress(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}
