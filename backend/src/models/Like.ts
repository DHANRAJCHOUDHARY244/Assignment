import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const likeSchema = new Schema(
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
      default: null,
      index: true,
    },
    ipAddress: { type: String, default: null, trim: true, index: true },
  },
  { timestamps: true },
);

likeSchema.index(
  { videoId: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: { userId: { $type: "objectId" } },
  },
);

likeSchema.index(
  { videoId: 1, ipAddress: 1 },
  {
    unique: true,
    partialFilterExpression: {
      userId: null,
      ipAddress: { $type: "string" },
    },
  },
);

likeSchema.pre("validate", function () {
  const doc = this as unknown as {
    userId?: mongoose.Types.ObjectId | null;
    ipAddress?: string | null;
  };

  if (!doc.userId && !doc.ipAddress) {
    throw new Error("Like requires userId or ipAddress");
  }
});

export type LikeDocument = InferSchemaType<typeof likeSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Like: Model<LikeDocument> =
  mongoose.models["Like"] ?? mongoose.model<LikeDocument>("Like", likeSchema);
