import mongoose, {
  Schema,
  type HydratedDocument,
  type InferSchemaType,
  type Model,
} from "mongoose";

const videoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, required: true, trim: true },
    likesCount: { type: Number, default: 0, min: 0 },
    sharesCount: { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

videoSchema.index({ isActive: 1, sortOrder: 1, createdAt: -1 });

export type VideoDocument = HydratedDocument<
  InferSchemaType<typeof videoSchema>
>;

export const Video: Model<VideoDocument> =
  mongoose.models["Video"] ??
  mongoose.model<VideoDocument>("Video", videoSchema);

export function toPublicVideo(doc: VideoDocument) {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description,
    url: doc.url,
    thumbnailUrl: doc.thumbnailUrl,
    likesCount: doc.likesCount,
    sharesCount: doc.sharesCount,
    commentsCount: doc.commentsCount,
    sortOrder: doc.sortOrder,
  };
}

export function toAdminVideo(doc: VideoDocument) {
  return {
    ...toPublicVideo(doc),
    isActive: doc.isActive,
  };
}
