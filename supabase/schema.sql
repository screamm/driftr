-- =============================================================================
-- DRIFTR - Van Life Community App
-- Complete Supabase Schema Migration
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- ---------------------------------------------------------------------------
-- 2. CUSTOM TYPES (enum-like constraints via CHECK, no enums for flexibility)
-- ---------------------------------------------------------------------------

-- Using CHECK constraints instead of ENUMs so values can evolve without
-- migrations. All validation lives in the table definitions below.

-- ---------------------------------------------------------------------------
-- 3. TABLES
-- ---------------------------------------------------------------------------

-- profiles ----------------------------------------------------------------
-- Extends auth.users with community-specific fields.
-- One row per authenticated user, created automatically on signup.

CREATE TABLE IF NOT EXISTS profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    bio             TEXT,
    avatar_url      TEXT,
    video_intro_url TEXT,

    -- Van & travel
    van_type        TEXT CHECK (van_type IN ('campervan','skoolie','sprinter','rv','car','truck','other')),
    travel_style    TEXT CHECK (travel_style IN ('fulltime','parttime','weekender','planning')),
    on_road_since   DATE,

    -- Live status & location
    status          TEXT NOT NULL DEFAULT 'parked' CHECK (status IN ('parked','rolling')),
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    location_name   TEXT,
    location_updated_at TIMESTAMPTZ,

    -- Discovery preferences
    looking_for     TEXT[] DEFAULT '{}',
    gender          TEXT,
    interested_in   TEXT[] DEFAULT '{}',
    age             INTEGER CHECK (age IS NULL OR (age >= 18 AND age <= 120)),

    -- Verification
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,

    -- Builder marketplace
    is_builder          BOOLEAN NOT NULL DEFAULT FALSE,
    builder_specialty   TEXT,
    builder_rate        TEXT,
    builder_description TEXT,

    -- Push notifications
    push_token      TEXT,

    -- Monetization
    premium_until   TIMESTAMPTZ,

    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- looking_for array values validation handled at application layer
    -- to keep the schema extensible without migrations.
    CONSTRAINT valid_coordinates CHECK (
        (latitude IS NULL AND longitude IS NULL)
        OR (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
    )
);

-- waves -------------------------------------------------------------------
-- A "wave" is a directional like/swipe from one user to another, scoped by
-- mode (dating or friends). A reciprocal wave triggers automatic match
-- creation via the check_and_create_match trigger function.

CREATE TABLE IF NOT EXISTS waves (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user   UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    to_user     UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    mode        TEXT NOT NULL CHECK (mode IN ('dating','friends')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT no_self_wave CHECK (from_user <> to_user),
    CONSTRAINT unique_wave  UNIQUE (from_user, to_user, mode)
);

-- matches -----------------------------------------------------------------
-- Bilateral connection created when two users wave at each other in the
-- same mode. user_a < user_b is enforced to prevent duplicate pairs.

CREATE TABLE IF NOT EXISTS matches (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a      UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    user_b      UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    mode        TEXT NOT NULL CHECK (mode IN ('dating','friends')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT ordered_pair CHECK (user_a < user_b),
    CONSTRAINT unique_match UNIQUE (user_a, user_b, mode)
);

-- messages ----------------------------------------------------------------
-- Chat messages between matched users. Only participants in the match can
-- read or write messages, enforced by RLS.

CREATE TABLE IF NOT EXISTS messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id    UUID NOT NULL REFERENCES matches (id) ON DELETE CASCADE,
    sender_id   UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    content     TEXT NOT NULL CHECK (char_length(content) > 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- builder_reviews ---------------------------------------------------------
-- Ratings and comments left on builder profiles. One review per
-- reviewer per builder.

CREATE TABLE IF NOT EXISTS builder_reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_id  UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT no_self_review       CHECK (builder_id <> reviewer_id),
    CONSTRAINT unique_builder_review UNIQUE (builder_id, reviewer_id)
);

-- daily_wave_count --------------------------------------------------------
-- Rate-limiting table. Tracks how many waves a user sends per day.
-- Free-tier users are capped at the application layer; premium users
-- may have higher or unlimited limits.

CREATE TABLE IF NOT EXISTS daily_wave_count (
    user_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    date    DATE NOT NULL DEFAULT CURRENT_DATE,
    count   INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),

    PRIMARY KEY (user_id, date)
);

-- ---------------------------------------------------------------------------
-- 4. INDEXES
-- ---------------------------------------------------------------------------

-- Geo: earth_box + earth_distance lookups on (latitude, longitude).
-- The earthdistance extension works on top of cube, using ll_to_earth().
-- We index the earth-point representation for fast bounding-box scans.

CREATE INDEX IF NOT EXISTS idx_profiles_earth_point
    ON profiles USING gist (ll_to_earth(latitude, longitude))
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Fast reciprocal-wave lookups: "did to_user already wave at from_user?"
CREATE INDEX IF NOT EXISTS idx_waves_reciprocal
    ON waves (to_user, from_user, mode);

-- Timeline ordering for waves per user
CREATE INDEX IF NOT EXISTS idx_waves_from_user_created
    ON waves (from_user, created_at DESC);

-- Message retrieval by match, ordered chronologically
CREATE INDEX IF NOT EXISTS idx_messages_match_created
    ON messages (match_id, created_at ASC);

-- Match lookups for either participant
CREATE INDEX IF NOT EXISTS idx_matches_user_a ON matches (user_a);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON matches (user_b);

-- Builder review aggregation
CREATE INDEX IF NOT EXISTS idx_builder_reviews_builder
    ON builder_reviews (builder_id);

-- Looking_for array search (GIN index for @> containment queries)
CREATE INDEX IF NOT EXISTS idx_profiles_looking_for
    ON profiles USING gin (looking_for);

-- ---------------------------------------------------------------------------
-- 5. FUNCTIONS
-- ---------------------------------------------------------------------------

-- 5a. Auto-create profile on auth signup -----------------------------------
-- Called by a trigger on auth.users. Creates a minimal profile row so the
-- user can immediately start filling in their details.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, name)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data ->> 'name',
            NEW.raw_user_meta_data ->> 'full_name',
            split_part(NEW.email, '@', 1)
        )
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists (edge case with retries), skip silently.
        RETURN NEW;
END;
$$;

-- 5b. Check and create match on wave insert --------------------------------
-- After a wave is inserted, check whether the target user has already waved
-- back in the same mode. If so, atomically create a match row.

CREATE OR REPLACE FUNCTION public.check_and_create_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_a UUID;
    v_user_b UUID;
BEGIN
    -- Check if reciprocal wave exists
    IF EXISTS (
        SELECT 1
        FROM waves
        WHERE from_user = NEW.to_user
          AND to_user   = NEW.from_user
          AND mode      = NEW.mode
    ) THEN
        -- Enforce ordered pair: smaller UUID = user_a
        IF NEW.from_user < NEW.to_user THEN
            v_user_a := NEW.from_user;
            v_user_b := NEW.to_user;
        ELSE
            v_user_a := NEW.to_user;
            v_user_b := NEW.from_user;
        END IF;

        INSERT INTO matches (user_a, user_b, mode)
        VALUES (v_user_a, v_user_b, NEW.mode)
        ON CONFLICT (user_a, user_b, mode) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

-- 5c. Nearby profiles search -----------------------------------------------
-- Returns profiles within a given radius (km) that include the requested
-- mode in their looking_for array. Excludes the requesting user.

CREATE OR REPLACE FUNCTION public.nearby_profiles(
    user_lat      DOUBLE PRECISION,
    user_lng      DOUBLE PRECISION,
    radius_km     DOUBLE PRECISION DEFAULT 50,
    filter_mode   TEXT DEFAULT NULL
)
RETURNS TABLE (
    id              UUID,
    name            TEXT,
    bio             TEXT,
    avatar_url      TEXT,
    video_intro_url TEXT,
    van_type        TEXT,
    travel_style    TEXT,
    status          TEXT,
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    location_name   TEXT,
    looking_for     TEXT[],
    gender          TEXT,
    age             INTEGER,
    is_verified     BOOLEAN,
    is_builder      BOOLEAN,
    distance_km     DOUBLE PRECISION
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.bio,
        p.avatar_url,
        p.video_intro_url,
        p.van_type,
        p.travel_style,
        p.status,
        p.latitude,
        p.longitude,
        p.location_name,
        p.looking_for,
        p.gender,
        p.age,
        p.is_verified,
        p.is_builder,
        -- earth_distance returns meters; convert to km
        (earth_distance(
            ll_to_earth(user_lat, user_lng),
            ll_to_earth(p.latitude, p.longitude)
        ) / 1000.0) AS distance_km
    FROM profiles p
    WHERE p.latitude IS NOT NULL
      AND p.longitude IS NOT NULL
      AND p.id <> auth.uid()
      -- Bounding-box pre-filter for index usage, then exact distance check
      AND earth_box(ll_to_earth(user_lat, user_lng), radius_km * 1000.0)
          @> ll_to_earth(p.latitude, p.longitude)
      AND earth_distance(
            ll_to_earth(user_lat, user_lng),
            ll_to_earth(p.latitude, p.longitude)
          ) <= (radius_km * 1000.0)
      -- Optional mode filter: if provided, profile must be looking for it
      AND (filter_mode IS NULL OR p.looking_for @> ARRAY[filter_mode])
    ORDER BY distance_km ASC;
END;
$$;

-- 5d. Increment wave count (upsert) ----------------------------------------
-- Atomically increments the daily wave counter for rate limiting.
-- Returns the new count so the application layer can enforce limits.

CREATE OR REPLACE FUNCTION public.increment_wave_count(
    p_user_id UUID,
    p_date    DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_count INTEGER;
BEGIN
    INSERT INTO daily_wave_count (user_id, date, count)
    VALUES (p_user_id, p_date, 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET count = daily_wave_count.count + 1
    RETURNING count INTO v_new_count;

    RETURN v_new_count;
END;
$$;

-- ---------------------------------------------------------------------------
-- 6. TRIGGERS
-- ---------------------------------------------------------------------------

-- Auto-create profile when a new user signs up via Supabase Auth
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Check for reciprocal wave and create match automatically
CREATE OR REPLACE TRIGGER on_wave_check_match
    AFTER INSERT ON waves
    FOR EACH ROW
    EXECUTE FUNCTION public.check_and_create_match();

-- ---------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE waves           ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches         ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_wave_count ENABLE ROW LEVEL SECURITY;

-- profiles ----------------------------------------------------------------

-- Anyone authenticated can read any profile (public discovery)
CREATE POLICY "Profiles are publicly readable"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

-- Users can only insert their own profile (fallback for edge cases;
-- the trigger normally handles creation)
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- waves -------------------------------------------------------------------

-- Users can insert waves where they are the sender
CREATE POLICY "Users can send waves"
    ON waves FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = from_user);

-- Users can see waves they sent or received (for UI state)
CREATE POLICY "Users can view own waves"
    ON waves FOR SELECT
    TO authenticated
    USING (auth.uid() = from_user OR auth.uid() = to_user);

-- matches -----------------------------------------------------------------

-- Users can see matches they are part of
CREATE POLICY "Users can view own matches"
    ON matches FOR SELECT
    TO authenticated
    USING (auth.uid() = user_a OR auth.uid() = user_b);

-- messages ----------------------------------------------------------------

-- Users can read messages in matches they belong to
CREATE POLICY "Users can read match messages"
    ON messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM matches m
            WHERE m.id = messages.match_id
              AND (m.user_a = auth.uid() OR m.user_b = auth.uid())
        )
    );

-- Users can send messages in matches they belong to
CREATE POLICY "Users can send match messages"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM matches m
            WHERE m.id = match_id
              AND (m.user_a = auth.uid() OR m.user_b = auth.uid())
        )
    );

-- builder_reviews ---------------------------------------------------------

-- Anyone authenticated can read builder reviews
CREATE POLICY "Builder reviews are publicly readable"
    ON builder_reviews FOR SELECT
    TO authenticated
    USING (true);

-- Users can insert reviews where they are the reviewer
CREATE POLICY "Users can write reviews"
    ON builder_reviews FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reviewer_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
    ON builder_reviews FOR UPDATE
    TO authenticated
    USING (auth.uid() = reviewer_id)
    WITH CHECK (auth.uid() = reviewer_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
    ON builder_reviews FOR DELETE
    TO authenticated
    USING (auth.uid() = reviewer_id);

-- daily_wave_count --------------------------------------------------------

-- Users can see their own wave counts
CREATE POLICY "Users can view own wave count"
    ON daily_wave_count FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can insert their own wave count rows
CREATE POLICY "Users can insert own wave count"
    ON daily_wave_count FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own wave count rows
CREATE POLICY "Users can update own wave count"
    ON daily_wave_count FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 8. GRANTS
-- ---------------------------------------------------------------------------

-- Grant usage on the public schema to the default Supabase roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant table access to authenticated users (RLS enforces row-level rules)
GRANT SELECT ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON waves TO authenticated;
GRANT ALL ON matches TO authenticated;
GRANT ALL ON messages TO authenticated;
GRANT ALL ON builder_reviews TO authenticated;
GRANT ALL ON daily_wave_count TO authenticated;

-- Service role bypasses RLS for admin operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant execute on public functions
GRANT EXECUTE ON FUNCTION public.nearby_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_wave_count TO authenticated;

-- ---------------------------------------------------------------------------
-- 9. REALTIME (optional - enable for chat)
-- ---------------------------------------------------------------------------

-- Enable realtime for messages so the chat UI receives live updates.
-- Supabase Realtime respects RLS policies.
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- ---------------------------------------------------------------------------
-- 10. STORAGE BUCKETS
-- ---------------------------------------------------------------------------

-- Avatars bucket (public, for profile photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Videos bucket (public, for video intros)
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: avatars ---------------------------------------------------

CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage RLS: videos ---------------------------------------------------

CREATE POLICY "Video intros are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'videos');

CREATE POLICY "Users can upload their own video"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'videos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own video"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'videos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own video"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'videos'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
