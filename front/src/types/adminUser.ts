export const USER_STATUSES = ["active", "blocked"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export type AdminUserStats = {
  likes: number;
  shares: number;
  comments: number;
};

export type AdminUserSummary = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  stats: AdminUserStats;
};

export type AdminUsersResponse = {
  items: AdminUserSummary[];
  total: number;
  page: number;
  limit: number;
};

export type AdminUserActivityItem = {
  id: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  createdAt: string;
  body?: string;
  platform?: string;
};

export type AdminUserDetail = {
  user: Omit<AdminUserSummary, "stats">;
  stats: AdminUserStats;
  likes: AdminUserActivityItem[];
  shares: AdminUserActivityItem[];
  comments: AdminUserActivityItem[];
};
