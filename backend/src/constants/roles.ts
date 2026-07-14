export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["active", "blocked"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const SHARE_PLATFORMS = [
  "copy",
  "whatsapp",
  "x",
  "facebook",
  "instagram",
] as const;
export type SharePlatform = (typeof SHARE_PLATFORMS)[number];
