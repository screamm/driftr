## Inspiration

Living on the road sounds romantic until you realize how isolating it can be. You pull into a new town every few days. Your friends are 500 miles behind you. Dating apps think you live somewhere — you don't. And when your van's electrical system dies in a parking lot in Portugal, there's no one to call.

The van life community is massive and growing — over 3.9 million Americans alone live nomadically — but there's no dedicated platform for them. Tinder doesn't understand that your location changes weekly. Meetup assumes you'll be around next Thursday. Reddit threads are great, but they don't tell you who's parked two kilometers away right now.

When we saw Quin Gable's brief — "A Trusted Community for Van Lifers to Connect" — it clicked immediately. This isn't a hypothetical problem. It's a daily reality for a huge, underserved community that's held together by Instagram hashtags and Facebook groups. They deserve a real product.

## What it does

Driftr is a map-first community app with three distinct connection modes:

**Dating** — Swipe-based matching designed for people who move. See who's nearby, wave at them, and if they wave back — it's a match. Start chatting before one of you rolls out.

**Friends** — Same intuitive UX, different intent. Find a hiking partner, a campfire neighbor, or someone to caravan with to the next spot. No romantic pressure.

**Builder Help** — A directory of verified van builders (electrical, solar, woodwork, full conversions) with ratings and reviews. When your alternator dies in the desert, find someone nearby who can actually help.

Every profile shows a **Parked/Rolling status** — a concept that only makes sense for nomadic life. Users can record a **15-second video intro** to earn a verified badge, building trust in a community that's protective by nature.

The map is the home screen. Every pin is a real person. Tap to see their van, their story, their video. No catfishing, no bots — just real people living the same lifestyle.

**Premium** unlocks unlimited daily waves, builder contact, expanded search radius (250km), and a profile badge — powered entirely by RevenueCat.

## How we built it

**React Native + Expo SDK 54** — Cross-platform from day one. Expo Router for file-based navigation gave us type-safe routing that scales cleanly across auth flows, onboarding, tabs, and modal screens.

**Supabase** — Our entire backend in one service. PostgreSQL with the earthdistance extension handles proximity queries (`nearby_profiles()` returns users within a configurable radius, sorted by distance). Row Level Security on every table. Realtime subscriptions power live chat. Storage handles avatar uploads and video intros. Auth supports email, Google, and Apple Sign-In.

**RevenueCat** — All subscription logic runs through RevenueCat. Two products (`driftr_monthly` at $7.99 and `driftr_annual` at $59.99 with a 7-day free trial), one entitlement (`premium`), one offering (`default`). Users are identified by their Supabase Auth ID so entitlements sync seamlessly. We built a custom `usePremium` hook that listens to `CustomerInfoUpdateListener` for real-time premium state across the app. The paywall triggers at five strategic touchpoints — the fourth daily wave, builder contact, "see who waved," radius expansion, and the premium badge upsell.

**Database trigger for matching** — When a wave is inserted, a PostgreSQL trigger checks for a reciprocal wave. If both users have waved at each other in the same mode, a match is automatically created. No polling, no cron jobs — just a clean database-level event.

**Zustand** for global state. **NativeWind** (Tailwind for React Native) for rapid, consistent styling. **react-native-reanimated** for smooth swipe gestures and match celebration animations.

## Challenges we ran into

**Geo-queries at scale** — Finding users within a radius sounds simple until you actually implement it. We needed the PostGIS `earthdistance` extension with a GiST index on lat/lng pairs. The `nearby_profiles()` RPC function handles filtering by mode, radius, and null coordinates — and we had to cap results at 50 pins to keep the map performant.

**Wave limiting across timezones** — The free tier allows 3 waves per day, but "per day" gets complicated when your users are spread across every timezone. We settled on a `daily_wave_count` table keyed by user ID and date (server-side UTC), which keeps the logic clean and cheat-resistant.

**Video verification UX** — Recording a 15-second selfie video needs to feel natural, not like a security checkpoint. We went through several iterations of the camera UI, countdown timer, and preview flow before landing on something that felt encouraging rather than invasive. The key insight: frame it as "show people you're real" instead of "prove your identity."

**Three modes, one codebase** — Dating and Friends share 90% of their UX but need distinct visual language (warm pink vs. cool blue), different copy ("It's a match!" vs. "New friend!"), and separate wave pools. Builder Help is a completely different interaction pattern — list-based with reviews instead of swipe-based. Keeping the codebase clean while supporting three distinct experiences required careful component abstraction.

**RevenueCat paywall placement** — Finding the right moments to show the paywall without feeling aggressive. We avoided blocking core functionality. Free users can still browse, swipe, and match — but we surface premium at natural friction points where the value proposition is immediately clear.

## Accomplishments that we're proud of

**It feels like a real product, not a hackathon project.** The onboarding is polished with five clear steps, progress indication, and van-specific choices (van type grid with icons, travel style selector, Parked/Rolling toggle). The map pins use actual user avatars with status indicators. Match celebrations have confetti. Small details that add up.

**The trust layer works.** Video intros with verified badges create a fundamentally different dynamic than anonymous profiles. During testing, profiles with video intros received significantly more waves. The community self-selects for authenticity.

**RevenueCat integration is deep, not superficial.** It's not a paywall bolted onto a free app. Premium genuinely unlocks meaningful value at moments users care about. The `usePremium` hook, `useWaveLimit` counter, and five touchpoint triggers form a cohesive monetization system that feels fair to free users and valuable to paying ones.

**The three-mode concept validates.** Dating, Friends, and Builder Help in one app isn't feature bloat — it reflects how this community actually works. The same person who wants a date on Friday needs a solar panel installed on Monday. Separate apps would fragment an already small, geographically dispersed user base.

## What we learned

**Map-first beats feed-first for nomads.** We initially considered a traditional scrollable feed. But for people whose entire life is defined by geography, the map isn't just a feature — it's the mental model. Every design decision improved once we committed to the map as home screen.

**Supabase's earthdistance extension is powerful but underdocumented.** Getting `ll_to_earth`, `earth_distance`, and GiST indexes working together required digging through PostgreSQL docs rather than Supabase tutorials. Worth it — the proximity queries are fast and accurate.

**RevenueCat's listener pattern is the right abstraction.** Instead of checking premium status on every screen mount, `addCustomerInfoUpdateListener` lets us react to subscription changes globally. One hook, consumed everywhere. Clean.

**Niche communities have strong opinions.** Van lifers care deeply about what "van type" options you offer. Missing "Skoolie" or lumping "Car Camper" with "RV" would be a credibility killer. The taxonomy matters as much as the technology.

**Freemium works when limits feel natural.** Three waves per day isn't an arbitrary paywall — it mirrors how people actually meet on the road. You don't approach 50 strangers at a campsite. The limit feels organic, which makes the premium upgrade feel like unlocking more of the experience rather than removing an obstacle.

## What's next for Driftr

**In-app builder payments (Q2 2026)** — Let users book and pay builders directly through the app, with a 10% commission. RevenueCat for subscriptions + Stripe Connect for service payments.

**Camp Together events (Q3 2026)** — Users can create and join meetup events ("Sunset gathering at Praia da Luz, Saturday 7pm"). Bridges the gap between digital connections and real-world community.

**Platform integrations (Q4 2026)** — Pull in campsite data from iOverlander and Park4Night. Show nearby free camping spots on the Discover map alongside user pins.

**Marketplace (2027)** — Buy and sell van life gear, used solar panels, and pre-built components. The Builder Help section already establishes commercial trust between users.

**White-label expansion** — The core concept (map-first community for mobile lifestyles) applies to sailing communities, cycle tourers, and overlanders. Same platform, different verticals.

The van life community is only growing. Driftr is the infrastructure it's been missing.
