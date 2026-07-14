import { SHARE_PLATFORMS } from "@/constants/api";

export type SharePlatform = (typeof SHARE_PLATFORMS)[number];

export type Video = {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  likesCount: number;
  sharesCount: number;
  commentsCount: number;
  sortOrder: number;
};

export type VideosResponse = {
  items: Video[];
  total: number;
  page: number;
  limit: number;
};

export type VideoCardProps = {
  video: Video;
  index: number;
  onSelect: (index: number) => void;
  shouldLoadVideo?: boolean;
  suspended?: boolean;
};

export type OuterCarouselProps = {
  videos: Video[];
  onSelect: (index: number) => void;
  suspended?: boolean;
};

export type ModalSlideProps = {
  video: Video;
  index: number;
  activeIndex: number;
  shouldLoad: boolean;
  shouldPlay: boolean;
  onUpdate: (patch: Partial<Video>) => void;
  onSelect?: (index: number) => void;
};

export type InnerModalProps = {
  videos: Video[];
  index: number;
  open: boolean;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
  onPatchVideo: (id: string, patch: Partial<Video>) => void;
};

export type VideoControlsProps = {
  playing: boolean;
  muted: boolean;
  loading: boolean;
  progress: number;
  onTogglePlay: () => void;
  onToggleMute: () => void;
};

export type LikeResult = {
  videoId: string;
  likesCount: number;
  liked: boolean;
};

export type ShareResult = {
  videoId: string;
  sharesCount: number;
  platform: SharePlatform;
};

export type Comment = {
  id: string;
  videoId: string;
  userId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type CommentsResponse = {
  items: Comment[];
  total: number;
  page: number;
  limit: number;
};

export type SocialBarProps = {
  video: Video;
  onUpdate: (patch: Partial<Video>) => void;
  variant?: "light" | "dark";
};

export type CommentBoxProps = {
  videoId: string;
  commentsCount: number;
  onCommentAdded: () => void;
  variant?: "light" | "dark";
};
