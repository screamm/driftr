# Driftr

**A Trusted Community for Van Lifers to Connect**

> Dating apps don't work when you move every three days.

Driftr is a location-based community app built exclusively for van lifers, nomads, and digital travelers. Three modes — **Dating**, **Friends**, and **Builder Help** — all centered around a map-first experience with trust at its core.

Built for the [RevenueCat Shipyard: Creator Contest](https://www.shipyard.fyi/) in collaboration with **Quin Gable**.

---

## The Problem

- **3.9 million Americans** live a nomadic lifestyle (MBO Partners, 2023) — and growing globally
- Existing platforms (Tinder, Bumble, Meetup) ignore transient lifestyles — they assume you stay in one place
- The van life community is tight-knit and protective — anonymous platforms feel unsafe
- No single app addresses **dating + friendship + skilled help** for people on the road

## The Solution

Driftr is the first app designed around how van lifers actually live:

- **Map-first navigation** — see who's parked nearby or rolling through your area
- **Three connection modes** — Dating, Friends, and Builder Help in one app
- **Trust through video verification** — record a 15-second intro to prove you're real
- **Parked/Rolling status** — a concept unique to nomadic life, built into every profile
- **Premium tier** for power users who want unlimited connections and builder access

---

## Features

### Discover Map
Full-screen map with custom avatar pins showing real van lifers near you. Tap any pin to see their profile, van type, video intro, and verification status.

### Dating Mode
Swipe-based matching with fellow travelers. Wave at someone you're interested in — if they wave back, it's a match. Start chatting and meet up at the next campsite.

### Friends Mode
Same intuitive UX, different intent. Find hiking buddies, campfire companions, or caravan partners without the romantic pressure.

### Builder Help
Browse verified van builders by specialty (electrical, solar, woodwork, full builds), read reviews, and contact them directly. Whether your alternator died in the desert or you're planning a full conversion.

### Video Verification
Record a 15-second video intro to earn a verified badge. No catfishing, no bots — just real people living the van life.

### Premium (RevenueCat)
Freemium model with strategic upgrade touchpoints:
- 3 free waves per day (unlimited with Premium)
- Contact builders directly
- See who waved at you
- Expanded 250km search radius
- Premium profile badge

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | React Native + Expo SDK 54 | Cross-platform, OTA updates, fast iteration |
| **Navigation** | Expo Router (file-based) | Type-safe, scalable routing |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime + Storage) | Auth, database, file storage, real-time chat — all in one |
| **Maps** | react-native-maps + Expo Location | Native map experience with GPS |
| **Monetization** | RevenueCat SDK | Subscription management, paywall, analytics |
| **State** | Zustand | Minimal boilerplate, performant |
| **Styling** | NativeWind (Tailwind CSS for RN) | Rapid, consistent UI development |
| **Animations** | react-native-reanimated | Smooth swipe gestures, micro-interactions |
| **Notifications** | Expo Notifications | Push notifications for waves, matches, messages |
| **Video** | expo-camera + expo-video | Record and play video intros |

---

## Architecture

```
React Native (Expo SDK 54)
├── Expo Router          (file-based navigation)
├── Zustand              (global state management)
├── NativeWind           (Tailwind CSS styling)
│
├── Supabase Client ───> Supabase
│   ├── PostgreSQL       (profiles, waves, matches, messages, reviews)
│   ├── Auth             (email, Google, Apple Sign-In)
│   ├── Realtime         (live chat)
│   └── Storage          (avatars, video intros)
│
├── RevenueCat SDK ────> RevenueCat
│   ├── Subscriptions    (monthly $7.99 / annual $59.99)
│   ├── Entitlements     ("premium")
│   └── Paywall          (5 strategic touchpoints)
│
├── Expo Location ─────> Device GPS
└── Expo Notifications ─> FCM / APNs
```

---

## RevenueCat Integration

RevenueCat powers all subscription logic in Driftr:

- **Products:** `driftr_monthly` ($7.99/mo) and `driftr_annual` ($59.99/yr with 7-day free trial)
- **Entitlement:** `premium` — gates unlimited waves, builder contact, expanded radius, and profile badge
- **Offering:** `default` — presents both packages on the paywall
- **User identification:** Synced with Supabase Auth user IDs
- **Restore purchases:** Fully implemented (Apple requirement)

### Paywall Touchpoints
1. Fourth wave of the day — "You've used your 3 free waves. Go Premium for unlimited."
2. Contact a builder — "Premium members can contact builders directly."
3. See who waved at you — "Someone waved! Go Premium to see who."
4. Expand search beyond 50km — "Expand to 250km with Premium."
5. Premium profile badge — "Stand out with a Premium badge."

---

## Monetization Strategy

| Metric | Target |
|--------|--------|
| **Free tier** | 3 waves/day, browse builders, 50km radius |
| **Premium** | Unlimited waves, builder contact, 250km radius, badge |
| **Monthly** | $7.99/month |
| **Annual** | $59.99/year (37% savings, 7-day free trial) |
| **Conversion target** | 5% free-to-premium |
| **Projected MRR** | 10K users → 500 premium → ~$4,000/month |

Builder Help serves as a secondary monetization lever — premium is required to contact builders, creating natural upgrade motivation for users with immediate needs.

---

## Project Structure

```
driftr/
├── app/
│   ├── _layout.tsx                 # Root layout (auth check, RevenueCat init)
│   ├── index.tsx                   # Splash / redirect
│   ├── (auth)/                     # Authentication flow
│   │   ├── welcome.tsx             # Welcome screen
│   │   ├── login.tsx               # Email / social login
│   │   └── signup.tsx              # Registration
│   ├── (onboarding)/               # 5-step onboarding
│   │   ├── basics.tsx              # Name, age, gender
│   │   ├── van-life.tsx            # Van type, travel style
│   │   ├── photo.tsx               # Profile photo + video intro
│   │   ├── looking-for.tsx         # Dating / Friends / Builder Help
│   │   └── location.tsx            # Map pin + Parked/Rolling status
│   ├── (tabs)/                     # Main app tabs
│   │   ├── discover.tsx            # Map view (home screen)
│   │   ├── dating.tsx              # Swipe cards — dating mode
│   │   ├── friends.tsx             # Swipe cards — friends mode
│   │   ├── builders.tsx            # Builder Help list
│   │   └── profile.tsx             # User profile + settings
│   └── (screens)/                  # Modal / push screens
│       ├── user-profile.tsx        # View other user's profile
│       ├── matches.tsx             # All matches list
│       ├── chat.tsx                # Real-time chat
│       ├── paywall.tsx             # RevenueCat paywall
│       ├── builder-detail.tsx      # Builder profile + reviews
│       └── settings.tsx            # App settings
├── components/                     # Reusable UI components
│   ├── SwipeCard.tsx               # Swipe gesture card
│   ├── MapPin.tsx                  # Custom map marker with avatar
│   ├── ProfileCard.tsx             # Compact profile card
│   ├── BuilderCard.tsx             # Builder list item
│   ├── WaveButton.tsx              # Wave (like) button
│   ├── StatusBadge.tsx             # Parked / Rolling badge
│   ├── VerifiedBadge.tsx           # Video verification badge
│   ├── VideoIntro.tsx              # Video intro player
│   ├── ChatBubble.tsx              # Chat message bubble
│   ├── MatchCelebration.tsx        # Match animation + confetti
│   └── OnboardingStep.tsx          # Onboarding step wrapper
├── hooks/                          # Custom React hooks
│   ├── usePremium.ts               # RevenueCat premium status
│   ├── useWaveLimit.ts             # Daily wave counter
│   ├── useNearbyProfiles.ts        # Geo-proximity profiles
│   ├── useLocation.ts              # Device location
│   └── useNotifications.ts         # Push notifications
└── lib/                            # Utilities & config
    ├── supabase.ts                 # Supabase client
    └── constants.ts                # App constants & theme
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Supabase project (free tier)
- RevenueCat account
- Android device/emulator or iOS simulator

### Setup

```bash
# Clone the repo
git clone https://github.com/your-username/driftr.git
cd driftr

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Fill in your Supabase and RevenueCat keys

# Start the development server
npx expo start
```

### Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_revenuecat_ios_key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_revenuecat_android_key
```

---

## Database Schema

6 tables with Row Level Security:

- **profiles** — user data, van type, travel style, location, verification status
- **waves** — directional likes (from_user → to_user) with mode (dating/friends)
- **matches** — bilateral waves, auto-created via database trigger
- **messages** — real-time chat between matched users
- **builder_reviews** — ratings and reviews for van builders
- **daily_wave_count** — free tier wave limiting (3/day)

Key database features:
- **PostGIS earthdistance** for proximity queries
- **Database trigger** for automatic match creation on bilateral waves
- **RPC function** `nearby_profiles()` for efficient geo-filtered queries

---

## Roadmap

| Timeline | Feature |
|----------|---------|
| **Q2 2026** | In-app payments for builder jobs (10% commission) |
| **Q3 2026** | "Camp Together" — community meetup events |
| **Q4 2026** | Integration with iOverlander & Park4Night |
| **2027** | Verified campsite reviews, van-life marketplace |
| **Long-term** | White-label for other nomadic communities (sailing, cycle touring) |

---

## Testing

```bash
# Run unit tests
npm test

# Build for Android (internal testing)
eas build --platform android --profile preview

# Build for production
eas build --platform android --profile production

# Submit to Google Play Internal Testing
eas submit --platform android --profile production
```

---

## Brief

**Creator:** Quin Gable
**Contest:** RevenueCat Shipyard: Creator Contest

---

## License

This project was built for the RevenueCat Shipyard: Creator Contest.
