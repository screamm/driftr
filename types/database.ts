export type VanType =
  | "campervan"
  | "skoolie"
  | "sprinter"
  | "rv"
  | "car"
  | "truck"
  | "other";

export type TravelStyle = "fulltime" | "parttime" | "weekender" | "planning";

export type UserStatus = "parked" | "rolling";

export type ConnectionMode = "dating" | "friends";

export type LookingFor = "dating" | "friends" | "builder_help";

export type Gender = "man" | "woman" | "nonbinary" | "prefer_not_to_say";

export interface Profile {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  video_intro_url: string | null;
  van_type: VanType | null;
  travel_style: TravelStyle | null;
  on_road_since: string | null;
  status: UserStatus;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  location_updated_at: string | null;
  looking_for: LookingFor[];
  gender: Gender | null;
  interested_in: Gender[];
  age: number | null;
  is_verified: boolean;
  is_builder: boolean;
  builder_specialty: string | null;
  builder_rate: string | null;
  builder_description: string | null;
  created_at: string;
  premium_until: string | null;
}

export interface Wave {
  id: string;
  from_user: string;
  to_user: string;
  mode: ConnectionMode;
  created_at: string;
}

export interface Match {
  id: string;
  user_a: string;
  user_b: string;
  mode: ConnectionMode;
  created_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface BuilderReview {
  id: string;
  builder_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface DailyWaveCount {
  user_id: string;
  date: string;
  count: number;
}

// Computed types for UI
export interface NearbyProfile extends Profile {
  distance_km: number;
}

export interface MatchWithProfile extends Match {
  other_user: Profile;
  last_message: Message | null;
  unread_count: number;
}

export interface BuilderProfile extends Profile {
  average_rating: number;
  review_count: number;
  reviews: BuilderReview[];
}
