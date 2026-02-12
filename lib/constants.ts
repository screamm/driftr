// Default avatar - a warm, earthy silhouette placeholder
// Using UI Avatars service which generates letter-based avatars
export function getDefaultAvatar(name?: string | null, size = 400): string {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=EFECE6&color=57534E&bold=true&format=png`;
}

// App constants
export const FREE_WAVE_LIMIT = 3;
export const MAX_VIDEO_DURATION = 15; // seconds
export const MAX_MAP_PINS = 50;
export const DEFAULT_RADIUS_KM = 50;
export const DEBOUNCE_MAP_MS = 500;

// RevenueCat
export const ENTITLEMENT_ID = "premium";
export const OFFERING_ID = "default";
