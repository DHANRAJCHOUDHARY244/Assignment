import type { Video } from "./video";

export type AdminVideo = Video & {
  isActive: boolean;
};

export type AdminVideosResponse = {
  items: AdminVideo[];
  total: number;
  page: number;
  limit: number;
};

export type VideoFormInput = {
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  sortOrder: number;
  isActive: boolean;
};
