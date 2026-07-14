import { API_PATHS } from "@/constants/api";
import { apiClient } from "@/lib/apiClient";
import type {
  ApiSuccess,
  Comment,
  CommentsResponse,
  LikeResult,
  SharePlatform,
  ShareResult,
  VideosResponse,
} from "@/types";

export async function fetchVideos(
  page = 1,
  limit = 40,
): Promise<VideosResponse> {
  const res = await apiClient.get<ApiSuccess<VideosResponse>>(
    `${API_PATHS.VIDEOS}?page=${page}&limit=${limit}`,
  );
  return res.data;
}

export async function likeVideo(videoId: string): Promise<LikeResult> {
  const res = await apiClient.post<ApiSuccess<LikeResult>>(
    `${API_PATHS.VIDEOS}/${videoId}/like`,
    {},
  );
  return res.data;
}

export async function shareVideo(
  videoId: string,
  platform: SharePlatform,
): Promise<ShareResult> {
  const res = await apiClient.post<ApiSuccess<ShareResult>>(
    `${API_PATHS.VIDEOS}/${videoId}/share`,
    { platform },
  );
  return res.data;
}

export async function fetchComments(
  videoId: string,
  page = 1,
  limit = 5,
): Promise<CommentsResponse> {
  const res = await apiClient.get<ApiSuccess<CommentsResponse>>(
    `${API_PATHS.VIDEOS}/${videoId}/comments?page=${page}&limit=${limit}`,
  );
  return res.data;
}

export async function addComment(
  videoId: string,
  body: string,
): Promise<Comment> {
  const res = await apiClient.post<ApiSuccess<Comment>>(
    `${API_PATHS.VIDEOS}/${videoId}/comments`,
    { body },
  );
  return res.data;
}
