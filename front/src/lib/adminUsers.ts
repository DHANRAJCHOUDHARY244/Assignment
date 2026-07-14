import { API_PATHS } from "@/constants/api";
import { apiClient } from "@/lib/apiClient";
import type {
  AdminUserDetail,
  AdminUsersResponse,
  ApiSuccess,
  UserStatus,
} from "@/types";

export const ADMIN_USERS_PAGE_SIZE = 12;

export async function fetchAdminUsers(
  page = 1,
  limit = ADMIN_USERS_PAGE_SIZE,
): Promise<AdminUsersResponse> {
  const res = await apiClient.get<ApiSuccess<AdminUsersResponse>>(
    `${API_PATHS.ADMIN_USERS}?page=${page}&limit=${limit}`,
  );
  return res.data;
}

export async function fetchAdminUserDetail(
  userId: string,
): Promise<AdminUserDetail> {
  const res = await apiClient.get<ApiSuccess<AdminUserDetail>>(
    `${API_PATHS.ADMIN_USERS}/${userId}`,
  );
  return res.data;
}

export async function updateAdminUserStatus(
  userId: string,
  status: UserStatus,
): Promise<void> {
  await apiClient.request<ApiSuccess<unknown>>(
    `${API_PATHS.ADMIN_USERS}/${userId}/status`,
    { method: "PATCH", body: { status } },
  );
}
