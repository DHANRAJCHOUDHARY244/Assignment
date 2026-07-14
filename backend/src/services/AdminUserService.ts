import mongoose from "mongoose";

import { Comment } from "../models/Comment";
import { Like } from "../models/Like";
import { Share } from "../models/Share";
import {
  isUserActive,
  toPublicUser,
  User,
  type UserDocument,
} from "../models/User";
import { Video } from "../models/Video";
import { HTTP_STATUS } from "../constants/httpStatus";
import type { UserStatus } from "../constants/roles";
import { BaseService } from "./BaseService";

async function countActivityForUsers(userIds: mongoose.Types.ObjectId[]) {
  const likes = new Map<string, number>();
  const shares = new Map<string, number>();
  const comments = new Map<string, number>();

  if (userIds.length === 0) {
    return { likes, shares, comments };
  }

  await Promise.all(
    userIds.map(async (userId) => {
      const key = String(userId);
      const [likeCount, shareCount, commentCount] = await Promise.all([
        Like.countDocuments({ userId }),
        Share.countDocuments({ userId }),
        Comment.countDocuments({ userId }),
      ]);
      likes.set(key, likeCount);
      shares.set(key, shareCount);
      comments.set(key, commentCount);
    }),
  );

  return { likes, shares, comments };
}

function validObjectIds(ids: string[]): mongoose.Types.ObjectId[] {
  return ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
}

export class AdminUserService extends BaseService {
  private async getUserOrThrow(id: string): Promise<UserDocument> {
    const _id = this.assertObjectId(id, "Invalid user id");
    const user = await User.findById(_id).select("-password");
    if (!user) {
      this.fail("User not found", HTTP_STATUS.NOT_FOUND);
    }
    return user;
  }

  async list(options: { page?: number; limit?: number }) {
    const { page, limit, skip } = this.paginate({
      page: options.page,
      limit: options.limit,
      maxLimit: 100,
    });

    const [users, total] = await Promise.all([
      User.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password")
        .lean(false),
      User.countDocuments(),
    ]);

    const userIds = users.map((user) => user._id);
    const activity = await countActivityForUsers(userIds);

    return {
      items: users.map((user) => ({
        ...toPublicUser(user),
        stats: {
          likes: activity.likes.get(String(user._id)) ?? 0,
          shares: activity.shares.get(String(user._id)) ?? 0,
          comments: activity.comments.get(String(user._id)) ?? 0,
        },
      })),
      total,
      page,
      limit,
    };
  }

  async getById(id: string) {
    const user = await this.getUserOrThrow(id);
    const userId = user._id;

    const [likes, shares, comments] = await Promise.all([
      Like.find({ userId }).sort({ createdAt: -1 }).limit(100).lean(),
      Share.find({ userId }).sort({ createdAt: -1 }).limit(100).lean(),
      Comment.find({ userId }).sort({ createdAt: -1 }).limit(100).lean(),
    ]);

    const videoIds = validObjectIds([
      ...new Set([
        ...likes.map((row) => String(row.videoId)),
        ...shares.map((row) => String(row.videoId)),
        ...comments.map((row) => String(row.videoId)),
      ]),
    ]);

    const videos =
      videoIds.length > 0
        ? await Video.find({ _id: { $in: videoIds } })
            .select("title thumbnailUrl")
            .lean()
        : [];

    const videoMap = new Map(
      videos.map((video) => [
        String(video._id),
        {
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
        },
      ]),
    );

    const videoMeta = (videoId: unknown) =>
      videoMap.get(String(videoId)) ?? {
        title: "Unknown video",
        thumbnailUrl: "",
      };

    return {
      user: toPublicUser(user),
      stats: {
        likes: likes.length,
        shares: shares.length,
        comments: comments.length,
      },
      likes: likes.map((row) => ({
        id: String(row._id),
        videoId: String(row.videoId),
        ...videoMeta(row.videoId),
        createdAt:
          row.createdAt instanceof Date
            ? row.createdAt.toISOString()
            : String(row.createdAt),
      })),
      shares: shares.map((row) => ({
        id: String(row._id),
        videoId: String(row.videoId),
        platform: row.platform,
        ...videoMeta(row.videoId),
        createdAt:
          row.createdAt instanceof Date
            ? row.createdAt.toISOString()
            : String(row.createdAt),
      })),
      comments: comments.map((row) => ({
        id: String(row._id),
        videoId: String(row.videoId),
        body: row.body,
        ...videoMeta(row.videoId),
        createdAt:
          row.createdAt instanceof Date
            ? row.createdAt.toISOString()
            : String(row.createdAt),
      })),
    };
  }

  async updateStatus(
    id: string,
    status: UserStatus,
    actorUserId: string,
  ): Promise<ReturnType<typeof toPublicUser>> {
    if (id === actorUserId && status === "blocked") {
      this.fail("You cannot block your own account", HTTP_STATUS.BAD_REQUEST);
    }

    const user = await this.getUserOrThrow(id);

    if (user.role === "admin" && status === "blocked") {
      this.fail("Admin accounts cannot be blocked", HTTP_STATUS.BAD_REQUEST);
    }

    const updated = await User.findByIdAndUpdate(
      user._id,
      { $set: { status } },
      { new: true, select: "-password" },
    );

    if (!updated) {
      this.fail("User not found", HTTP_STATUS.NOT_FOUND);
    }

    return toPublicUser(updated);
  }
}

export const adminUserService = new AdminUserService();

export { isUserActive };
