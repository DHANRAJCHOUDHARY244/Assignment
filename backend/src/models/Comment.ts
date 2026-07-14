import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const commentSchema = new Schema(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

commentSchema.index({ videoId: 1, createdAt: -1 });

export type CommentDocument = InferSchemaType<typeof commentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Comment: Model<CommentDocument> =
  mongoose.models["Comment"] ??
  mongoose.model<CommentDocument>("Comment", commentSchema);

export function toPublicComment(doc: CommentDocument) {
  return {
    id: String(doc._id),
    videoId: String(doc.videoId),
    userId: String(doc.userId),
    body: doc.body,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
