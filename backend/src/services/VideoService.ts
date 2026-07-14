import { Comment, toPublicComment } from "../models/Comment";
import { Like } from "../models/Like";
import { Share } from "../models/Share";
import { Video, toAdminVideo, toPublicVideo, type VideoDocument } from "../models/Video";
import { SHARE_PLATFORMS, type SharePlatform } from "../constants/roles";
import { HTTP_STATUS } from "../constants/httpStatus";
import { BaseService } from "./BaseService";

type ListOptions = {
  page?: number;
  limit?: number;
  includeInactive?: boolean;
};

type VideoInput = {
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  likesCount?: number;
  sharesCount?: number;
  commentsCount?: number;
  isActive?: boolean;
  sortOrder?: number;
};

export class VideoService extends BaseService {
  private async getVideoOrThrow(
    id: string,
    activeOnly = true,
  ): Promise<VideoDocument> {
    const _id = this.assertObjectId(id, "Invalid video id");
    const filter = activeOnly ? { _id, isActive: true } : { _id };
    const video = await Video.findOne(filter);
    if (!video) {
      this.fail("Video not found", HTTP_STATUS.NOT_FOUND);
    }
    return video;
  }

  async list(options: ListOptions = {}) {
    const { page, limit, skip } = this.paginate({
      page: options.page,
      limit: options.limit,
      maxLimit: 100,
    });
    const filter = options.includeInactive ? {} : { isActive: true };

    const [items, total] = await Promise.all([
      Video.find(filter)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Video.countDocuments(filter),
    ]);

    return {
      items: items.map((doc) =>
        options.includeInactive ? toAdminVideo(doc) : toPublicVideo(doc),
      ),
      total,
      page,
      limit,
    };
  }

  async getById(id: string, includeInactive = false) {
    const video = await this.getVideoOrThrow(id, !includeInactive);
    return toPublicVideo(video);
  }

  async create(input: VideoInput, admin = false) {
    const video = await Video.create({
      ...input,
      likesCount: input.likesCount ?? 0,
      sharesCount: input.sharesCount ?? 0,
      commentsCount: input.commentsCount ?? 0,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    });
    return admin ? toAdminVideo(video) : toPublicVideo(video);
  }

  async update(id: string, input: Partial<VideoInput>, admin = false) {
    const video = await this.getVideoOrThrow(id, false);
    Object.assign(video, input);
    await video.save();
    return admin ? toAdminVideo(video) : toPublicVideo(video);
  }

  async softDelete(id: string, admin = false) {
    const video = await this.getVideoOrThrow(id, false);
    video.isActive = false;
    await video.save();
    return admin ? toAdminVideo(video) : toPublicVideo(video);
  }

  async like(input: {
    videoId: string;
    userId?: string | undefined;
    ipAddress?: string | undefined;
  }) {
    const video = await this.getVideoOrThrow(input.videoId);
    const userId = input.userId
      ? this.assertObjectId(input.userId)
      : null;
    const ipAddress = userId ? null : (input.ipAddress ?? null);

    if (!userId && !ipAddress) {
      this.fail("userId or ipAddress required to like", HTTP_STATUS.BAD_REQUEST);
    }

    try {
      await Like.create({
        videoId: video._id,
        userId,
        ipAddress,
      });
      video.likesCount += 1;
      await video.save();
    } catch (error) {
      if (!this.isDuplicateKeyError(error)) throw error;
    }

    return {
      videoId: String(video._id),
      likesCount: video.likesCount,
      liked: true,
    };
  }

  async share(input: {
    videoId: string;
    platform: string;
    userId?: string | undefined;
    ipAddress?: string | undefined;
  }) {
    if (!(SHARE_PLATFORMS as readonly string[]).includes(input.platform)) {
      this.fail("Invalid share platform", HTTP_STATUS.BAD_REQUEST);
    }

    const video = await this.getVideoOrThrow(input.videoId);
    await Share.create({
      videoId: video._id,
      platform: input.platform as SharePlatform,
      userId: input.userId ? this.assertObjectId(input.userId) : null,
      ipAddress: input.ipAddress ?? null,
    });

    video.sharesCount += 1;
    await video.save();

    return {
      videoId: String(video._id),
      sharesCount: video.sharesCount,
      platform: input.platform,
    };
  }

  async listComments(
    videoId: string,
    options: { page?: number; limit?: number } = {},
  ) {
    await this.getVideoOrThrow(videoId);
    const { page, limit, skip } = this.paginate({
      page: options.page,
      limit: options.limit,
      maxLimit: 50,
    });
    const _id = this.assertObjectId(videoId);

    const [items, total] = await Promise.all([
      Comment.find({ videoId: _id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments({ videoId: _id }),
    ]);

    return {
      items: items.map(toPublicComment),
      total,
      page,
      limit,
    };
  }

  async addComment(input: {
    videoId: string;
    userId: string;
    body: string;
  }) {
    const video = await this.getVideoOrThrow(input.videoId);
    const comment = await Comment.create({
      videoId: video._id,
      userId: this.assertObjectId(input.userId),
      body: input.body.trim(),
    });

    video.commentsCount += 1;
    await video.save();

    return toPublicComment(comment);
  }
}

export const videoService = new VideoService();
