import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    userAgent: { type: String, default: null, trim: true },
    ipAddress: { type: String, default: null, trim: true },
    rememberMe: { type: Boolean, default: false },
  },
  { timestamps: true },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ userId: 1, revokedAt: 1 });

export type RefreshTokenDocument = InferSchemaType<
  typeof refreshTokenSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const RefreshToken: Model<RefreshTokenDocument> =
  mongoose.models["RefreshToken"] ??
  mongoose.model<RefreshTokenDocument>("RefreshToken", refreshTokenSchema);

export function isRefreshTokenActive(doc: RefreshTokenDocument): boolean {
  return doc.revokedAt == null && doc.expiresAt.getTime() > Date.now();
}
