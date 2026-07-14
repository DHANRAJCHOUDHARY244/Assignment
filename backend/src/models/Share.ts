import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import { SHARE_PLATFORMS, type SharePlatform } from "../constants/roles";

const shareSchema = new Schema(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: SHARE_PLATFORMS,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    ipAddress: { type: String, default: null, trim: true },
  },
  { timestamps: true },
);

shareSchema.index({ videoId: 1, createdAt: -1 });
shareSchema.index({ ipAddress: 1, createdAt: -1 });

export type ShareDocument = InferSchemaType<typeof shareSchema> & {
  _id: mongoose.Types.ObjectId;
  platform: SharePlatform;
};

export const Share: Model<ShareDocument> =
  mongoose.models["Share"] ??
  mongoose.model<ShareDocument>("Share", shareSchema);
