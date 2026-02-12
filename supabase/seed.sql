-- =============================================================================
-- DRIFTR - Seed Data
-- 35 realistic test profiles spread across popular van life locations
-- =============================================================================

-- NOTE: These profiles reference auth.users IDs that must exist first.
-- In development, create test auth users via Supabase dashboard or
-- use these UUIDs as placeholders that map to test accounts.

-- Helper: Generate deterministic UUIDs for seed data
-- In production, these come from auth.users. For seeding, we insert directly.

-- Temporarily disable RLS for seeding
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ---- DATING PROFILES (15) ----

INSERT INTO profiles (id, name, bio, avatar_url, van_type, travel_style, on_road_since, status, latitude, longitude, location_name, looking_for, gender, interested_in, age, is_verified) VALUES
-- Algarve, Portugal cluster
('11111111-1111-1111-1111-111111111101', 'Luna Svensson', 'Swedish surfer living in a T5 since 2022. Chasing waves down the Portuguese coast. Can fix your solar setup if you buy me a coffee.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'campervan', 'fulltime', '2022-03-15', 'parked', 37.0893, -8.2473, 'Lagos, Portugal', '{dating,friends}', 'woman', '{man,woman}', 28, true),

('11111111-1111-1111-1111-111111111102', 'Marco Rossi', 'Italian chef turned nomad. Cooking pasta in my Sprinter across Europe. Looking for someone who appreciates a good meal and a sunset.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'sprinter', 'fulltime', '2021-06-01', 'parked', 37.1023, -8.6745, 'Sagres, Portugal', '{dating}', 'man', '{woman}', 32, true),

('11111111-1111-1111-1111-111111111103', 'Jade Williams', 'Freelance illustrator. My skoolie is my studio. Currently painting the Algarve coastline. Dog mom to Bowie (border collie).', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'skoolie', 'fulltime', '2020-09-20', 'rolling', 37.0167, -7.9353, 'Faro, Portugal', '{dating,friends}', 'woman', '{man}', 26, true),

('11111111-1111-1111-1111-111111111104', 'Thomas Bergmann', 'German software dev. Remote work from my camper. Weekend surfer, weekday coder. Solar powered and loving it.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'campervan', 'fulltime', '2023-01-10', 'parked', 37.0944, -8.2500, 'Lagos, Portugal', '{dating,friends}', 'man', '{woman}', 30, false),

-- Andalusia, Spain cluster
('11111111-1111-1111-1111-111111111105', 'Carmen Delgado', 'Born in Sevilla, living on the road. My Renault Master is small but mighty. Flamenco dancer by passion, web designer by trade.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', 'campervan', 'fulltime', '2022-11-01', 'parked', 36.7213, -4.4214, 'Málaga, Spain', '{dating}', 'woman', '{man}', 27, true),

('11111111-1111-1111-1111-111111111106', 'Oliver Smith', 'British bloke in a beaten-up Transit. 3 years on the road, still can not parallel park. Looking for adventure and maybe love.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'campervan', 'fulltime', '2021-04-15', 'rolling', 36.8381, -2.4597, 'Almería, Spain', '{dating,friends}', 'man', '{woman}', 34, true),

('11111111-1111-1111-1111-111111111107', 'Anika Patel', 'Yoga teacher living in an RV. Teaching classes at campsites across southern Spain. Vegan, minimalist, and very happy about it.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', 'rv', 'fulltime', '2023-05-20', 'parked', 36.7502, -3.7899, 'Nerja, Spain', '{dating,friends}', 'woman', '{everyone}', 29, false),

-- Colorado, USA cluster
('11111111-1111-1111-1111-111111111108', 'Jake Morrison', 'Colorado native. Traded my apartment for a 4x4 Sprinter. Snowboarding in winter, mountain biking in summer. Photographer.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400', 'sprinter', 'fulltime', '2022-08-01', 'parked', 39.7392, -104.9903, 'Denver, CO', '{dating}', 'man', '{woman}', 31, true),

('11111111-1111-1111-1111-111111111109', 'Sierra Chen', 'Rock climber and nurse practitioner. Traveling between climbing spots in my Tacoma camper. Looking for a belay partner and maybe more.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', 'truck', 'fulltime', '2023-02-14', 'rolling', 38.8339, -104.8214, 'Colorado Springs, CO', '{dating}', 'woman', '{man}', 27, true),

('11111111-1111-1111-1111-111111111110', 'River Blackwood', 'Non-binary adventurer. Art teacher turned van lifer. My converted school bus is a mobile gallery. They/them.', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400', 'skoolie', 'fulltime', '2021-10-01', 'parked', 40.0150, -105.2705, 'Boulder, CO', '{dating,friends}', 'nonbinary', '{everyone}', 33, true),

-- British Columbia, Canada cluster
('11111111-1111-1111-1111-111111111111', 'Maple Richardson', 'Canadian born and raised. My Westfalia is older than me but runs like a dream. Trail runner, coffee snob, eternal optimist.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', 'campervan', 'parttime', '2023-07-01', 'parked', 49.2827, -123.1207, 'Vancouver, BC', '{dating}', 'woman', '{man}', 25, false),

('11111111-1111-1111-1111-111111111112', 'Finn O''Brien', 'Irish lad living the dream in Canada. Carpenter by trade, vandweller by choice. Building custom interiors between surf sessions.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 'sprinter', 'fulltime', '2022-04-01', 'rolling', 48.4284, -123.3656, 'Victoria, BC', '{dating,friends}', 'man', '{woman}', 29, true),

-- New Zealand cluster
('11111111-1111-1111-1111-111111111113', 'Aroha Tui', 'Kiwi girl exploring her own country by van. Marine biologist studying coastal ecosystems. My van smells like the ocean.', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400', 'campervan', 'parttime', '2023-09-15', 'parked', -36.8485, 174.7633, 'Auckland, NZ', '{dating}', 'woman', '{man,woman}', 24, true),

('11111111-1111-1111-1111-111111111114', 'Liam Hartley', 'Aussie in NZ. Left Sydney for the mountains. Ski instructor in winter, freediver in summer. Living in a Hiace and loving it.', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400', 'campervan', 'fulltime', '2022-12-01', 'rolling', -44.2082, 170.1349, 'Aoraki, NZ', '{dating}', 'man', '{woman}', 28, true),

('11111111-1111-1111-1111-111111111115', 'Freya Nielsen', 'Danish backpacker turned van lifer. Writing a book about solo female van life. My camper is called Greta. She is temperamental.', 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400', 'campervan', 'fulltime', '2023-03-01', 'parked', -41.2865, 174.7762, 'Wellington, NZ', '{dating,friends}', 'woman', '{man}', 31, false);

-- ---- FRIENDS PROFILES (10) ----

INSERT INTO profiles (id, name, bio, avatar_url, van_type, travel_style, on_road_since, status, latitude, longitude, location_name, looking_for, gender, age, is_verified) VALUES

('11111111-1111-1111-1111-111111111201', 'Sam Rivera', 'Digital nomad from Austin. Full-time in my Transit. Always down for a beach bonfire or hiking buddy. Bring your dog!', 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400', 'campervan', 'fulltime', '2022-05-01', 'parked', 37.0893, -8.2473, 'Lagos, Portugal', '{friends}', 'man', 26, true),

('11111111-1111-1111-1111-111111111202', 'Elise Fontaine', 'French teacher traveling through Spain. Looking for hiking partners and campfire conversations. Fluent in 4 languages.', 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400', 'rv', 'parttime', '2023-06-15', 'rolling', 36.7213, -4.4214, 'Málaga, Spain', '{friends}', 'woman', 35, true),

('11111111-1111-1111-1111-111111111203', 'Bodhi Nakamura', 'Japanese-American surfer. Converted my own van from scratch. Happy to share tools and knowledge. Let us ride some waves together.', 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400', 'campervan', 'fulltime', '2021-08-01', 'parked', 39.7392, -104.9903, 'Denver, CO', '{friends,builder_help}', 'man', 30, true),

('11111111-1111-1111-1111-111111111204', 'Iris Kowalski', 'Polish musician on wheels. Playing guitar at open mics across Europe. My van is my tour bus. Looking for jam session partners!', 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400', 'campervan', 'fulltime', '2022-02-28', 'parked', 37.1023, -8.6745, 'Sagres, Portugal', '{friends}', 'woman', 27, false),

('11111111-1111-1111-1111-111111111205', 'Kai Tanaka', 'Retired early at 35. Now I drive slowly and cook elaborately. Always happy to share a meal with fellow travelers.', 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400', 'rv', 'fulltime', '2023-01-01', 'rolling', 48.4284, -123.3656, 'Victoria, BC', '{friends}', 'man', 37, true),

('11111111-1111-1111-1111-111111111206', 'Willow Hart', 'Herbalist and forager. Teaching wild plant workshops from my camper. Come learn which berries will not kill you.', 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400', 'campervan', 'fulltime', '2022-09-01', 'parked', 40.0150, -105.2705, 'Boulder, CO', '{friends}', 'woman', 32, true),

('11111111-1111-1111-1111-111111111207', 'Zane Müller', 'Swiss mountain guide. Spending the off-season exploring coastlines. Always up for a hike or a cold beer.', 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400', 'sprinter', 'parttime', '2023-04-01', 'rolling', 36.8381, -2.4597, 'Almería, Spain', '{friends}', 'man', 33, true),

('11111111-1111-1111-1111-111111111208', 'Noa Petersen', 'Danish photographer. Documenting van life culture across continents. Would love to photograph your build!', 'https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=400', 'campervan', 'fulltime', '2021-11-01', 'parked', -36.8485, 174.7633, 'Auckland, NZ', '{friends}', 'woman', 29, true),

('11111111-1111-1111-1111-111111111209', 'Ash Coleman', 'Ex-military, now full-time traveler. Training for ultramarathons on the road. Always looking for running buddies.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', 'truck', 'fulltime', '2022-07-04', 'rolling', -44.2082, 170.1349, 'Aoraki, NZ', '{friends}', 'man', 36, false),

('11111111-1111-1111-1111-111111111210', 'Mila Okafor', 'Nigerian-British travel blogger. 2M followers but still just a girl in a van. Let us explore together!', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400', 'sprinter', 'fulltime', '2023-08-01', 'parked', 49.2827, -123.1207, 'Vancouver, BC', '{friends}', 'woman', 28, true);

-- ---- BUILDER PROFILES (10) ----

INSERT INTO profiles (id, name, bio, avatar_url, van_type, travel_style, on_road_since, status, latitude, longitude, location_name, looking_for, gender, age, is_verified, is_builder, builder_specialty, builder_rate, builder_description) VALUES

('11111111-1111-1111-1111-111111111301', 'Erik Johansson', 'Master electrician turned van builder. 200+ builds completed. Specializing in lithium battery systems and solar installs. Based in Algarve winters, Scandinavia summers.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', 'sprinter', 'fulltime', '2019-03-01', 'parked', 37.0893, -8.2473, 'Lagos, Portugal', '{builder_help,friends}', 'man', 42, true, true, 'Electrical & Solar', '€55/hour', 'Full electrical systems: lithium batteries, solar panels, inverters, shore power. 12V and 240V. Certified electrician with 15 years experience. Can source parts locally in Portugal.'),

('11111111-1111-1111-1111-111111111302', 'Rosa Carpenter', 'Woodworker and interior designer. I make vans beautiful AND functional. Custom cabinetry, flooring, insulation. Show me your empty shell and I will show you home.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', 'skoolie', 'fulltime', '2020-06-15', 'parked', 36.7213, -4.4214, 'Málaga, Spain', '{builder_help}', 'woman', 38, true, true, 'Woodwork & Interiors', '€45/hour', 'Custom interiors from concept to completion. Specializing in space-efficient designs, hidden storage, convertible beds, and sustainable materials. Portfolio available on request.'),

('11111111-1111-1111-1111-111111111303', 'Pete Jackson', 'Mechanic and builder. If it has an engine, I can fix it. If it is a van, I can convert it. 30 years under the hood.', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400', 'campervan', 'fulltime', '2018-01-01', 'rolling', 39.7392, -104.9903, 'Denver, CO', '{builder_help,friends}', 'man', 55, true, true, 'Mechanical & Full Builds', '$65/hour', 'Complete van conversions from mechanical prep to final finish. Engine rebuilds, suspension upgrades, rust repair. Sprinter and Transit specialist. Mobile service available within 100km.'),

('11111111-1111-1111-1111-111111111304', 'Yuki Tanaka', 'Plumber and gas fitter. Specialized in compact water systems for vans. Hot showers, composting toilets, grey water recycling.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'sprinter', 'parttime', '2021-09-01', 'parked', 48.4284, -123.3656, 'Victoria, BC', '{builder_help}', 'man', 34, true, true, 'Plumbing & Water Systems', 'CAD $70/hour', 'Complete water systems: freshwater tanks, pumps, water heaters, outdoor showers, composting toilets. Certified gas fitter for propane systems. Winterization specialist.'),

('11111111-1111-1111-1111-111111111305', 'Nina Volkov', 'Insulation and climate control specialist. Keeping you warm in Norway and cool in Spain. Spray foam, Thinsulate, ventilation fans.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', 'campervan', 'fulltime', '2022-01-01', 'parked', 37.1023, -8.6745, 'Sagres, Portugal', '{builder_help,friends}', 'woman', 31, true, true, 'Insulation & Climate', '€40/hour', 'Climate control for all seasons. Spray foam insulation, Thinsulate installation, MaxxFan/MaxxAir fitting, diesel heater installs (Webasto/Espar). Sound deadening included.'),

('11111111-1111-1111-1111-111111111306', 'Danny O''Sullivan', 'Solar panel installer and off-grid power expert. I will get you off the grid permanently. Free energy assessments for fellow vanlifers.', 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400', 'rv', 'fulltime', '2020-11-01', 'rolling', 36.8381, -2.4597, 'Almería, Spain', '{builder_help}', 'man', 40, true, true, 'Solar & Off-Grid Power', '€50/hour', 'Solar panel systems from 200W to 1200W. MPPT charge controllers, lithium battery banks, inverter/charger combos. System monitoring via Bluetooth. 5-year warranty on installations.'),

('11111111-1111-1111-1111-111111111307', 'Astrid Berg', 'Welder and metal fabricator. Custom roof racks, bed frames, bike mounts, bull bars. If it is metal, I can make it.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 'campervan', 'fulltime', '2021-05-01', 'parked', 40.0150, -105.2705, 'Boulder, CO', '{builder_help,friends}', 'woman', 36, true, true, 'Welding & Fabrication', '$55/hour', 'Custom metalwork for van builds. Roof racks, ladder systems, bed platforms, storage solutions, bike and surf racks. MIG, TIG, and stick welding. Aluminum and steel.'),

('11111111-1111-1111-1111-111111111308', 'Leo Martinez', 'Full-build specialist. From empty cargo van to dream home. Project management, materials sourcing, and hands-on building. 50+ completed builds.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', 'sprinter', 'fulltime', '2019-08-01', 'parked', -36.8485, 174.7633, 'Auckland, NZ', '{builder_help}', 'man', 45, true, true, 'Full Builds', 'NZD $75/hour', 'Complete van conversions from start to finish. 50+ builds completed. Sprinter, Transit, Hiace specialist. Full project management including permits, materials, and timeline. References available.'),

('11111111-1111-1111-1111-111111111309', 'Saga Lindqvist', 'Upholstery and soft furnishing specialist. Custom cushions, curtains, and covers that actually fit your weird van shapes. Making vans cozy since 2020.', 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400', 'campervan', 'parttime', '2022-03-01', 'rolling', 49.2827, -123.1207, 'Vancouver, BC', '{builder_help,friends}', 'woman', 29, true, true, 'Upholstery & Soft Furnishings', 'CAD $45/hour', 'Custom cushions, seat covers, curtains, and soft storage. Memory foam mattress cutting to fit any shape. Fabric sourcing and color consultation included. Can work on-site at your van.'),

('11111111-1111-1111-1111-111111111310', 'Ravi Kumar', 'Electronics and smart home specialist. Home automation for vans: lighting, monitoring, app control. Making your van smarter than your apartment.', 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400', 'sprinter', 'fulltime', '2021-12-01', 'parked', -41.2865, 174.7762, 'Wellington, NZ', '{builder_help}', 'man', 33, true, true, 'Electronics & Smart Systems', 'NZD $65/hour', 'Smart van systems: LED lighting control, battery monitoring via app, temperature sensors, security cameras, keyless entry. Custom PCB design for specific needs. Arduino and Raspberry Pi based solutions.');

-- ---- BUILDER REVIEWS ----

INSERT INTO builder_reviews (builder_id, reviewer_id, rating, comment) VALUES
('11111111-1111-1111-1111-111111111301', '11111111-1111-1111-1111-111111111101', 5, 'Erik did an amazing solar install on my T5. Super professional, explained everything, and the system works flawlessly. Highly recommended!'),
('11111111-1111-1111-1111-111111111301', '11111111-1111-1111-1111-111111111104', 5, 'Best electrician I have found on the road. Fixed my dodgy wiring AND upgraded my battery system. Fair price too.'),
('11111111-1111-1111-1111-111111111302', '11111111-1111-1111-1111-111111111105', 5, 'Rosa transformed my bare van into a beautiful home. The woodwork is stunning and the design is so smart. Worth every euro.'),
('11111111-1111-1111-1111-111111111302', '11111111-1111-1111-1111-111111111107', 4, 'Great work on the interior. Only 4 stars because it took a bit longer than quoted, but the quality is excellent.'),
('11111111-1111-1111-1111-111111111303', '11111111-1111-1111-1111-111111111108', 5, 'Pete rebuilt my engine AND helped plan my conversion. The guy knows everything about vans. A legend.'),
('11111111-1111-1111-1111-111111111303', '11111111-1111-1111-1111-111111111110', 4, 'Solid mechanical work. Fixed my transmission issue that two other mechanics could not diagnose.'),
('11111111-1111-1111-1111-111111111305', '11111111-1111-1111-1111-111111111102', 5, 'Nina insulated my Sprinter and it is warm even in Portuguese winter nights. Professional, fast, and friendly.'),
('11111111-1111-1111-1111-111111111306', '11111111-1111-1111-1111-111111111106', 5, 'Danny installed a 600W solar system in one day. Everything works perfectly and he set up the monitoring app. Brilliant.'),
('11111111-1111-1111-1111-111111111307', '11111111-1111-1111-1111-111111111109', 5, 'Custom roof rack and bike mount. Strong, clean welds, and it looks factory-made. Astrid is incredibly skilled.'),
('11111111-1111-1111-1111-111111111308', '11111111-1111-1111-1111-111111111113', 5, 'Leo managed my entire Hiace build from start to finish. 6 weeks, on budget, and the result is better than I imagined.');

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Confirm seed count
DO $$
DECLARE
    profile_count INTEGER;
    review_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    SELECT COUNT(*) INTO review_count FROM builder_reviews;
    RAISE NOTICE 'Seeded % profiles and % reviews', profile_count, review_count;
END $$;
