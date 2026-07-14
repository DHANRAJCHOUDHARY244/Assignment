import { API_PATHS } from "@/constants/api";
import { apiClient } from "@/lib/apiClient";
import type {
  AdminVideo,
  AdminVideosResponse,
  ApiSuccess,
  VideoFormInput,
} from "@/types";

const ADMIN_PAGE_SIZE = 12;

export async function fetchAdminVideos(
  page = 1,
  limit = ADMIN_PAGE_SIZE,
): Promise<AdminVideosResponse> {
  const res = await apiClient.get<ApiSuccess<AdminVideosResponse>>(
    `${API_PATHS.ADMIN_VIDEOS}?page=${page}&limit=${limit}`,
  );
  return res.data;
}

export { ADMIN_PAGE_SIZE };

export async function createAdminVideo(
  input: VideoFormInput,
): Promise<AdminVideo> {
  const res = await apiClient.post<ApiSuccess<AdminVideo>>(
    API_PATHS.ADMIN_VIDEOS,
    input,
  );
  return res.data;
}

export async function updateAdminVideo(
  id: string,
  input: Partial<VideoFormInput>,
): Promise<AdminVideo> {
  const res = await apiClient.request<ApiSuccess<AdminVideo>>(
    `${API_PATHS.ADMIN_VIDEOS}/${id}`,
    { method: "PATCH", body: input },
  );
  return res.data;
}

export async function deactivateAdminVideo(id: string): Promise<AdminVideo> {
  const res = await apiClient.request<ApiSuccess<AdminVideo>>(
    `${API_PATHS.ADMIN_VIDEOS}/${id}`,
    { method: "DELETE" },
  );
  return res.data;
}
