import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import {
  USER_ROLES,
  USER_STATUSES,
  type UserRole,
  type UserStatus,
} from "../constants/roles";

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "user" satisfies UserRole,
    },
    status: {
      type: String,
      enum: USER_STATUSES,
      default: "active" satisfies UserStatus,
      index: true,
    },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User: Model<UserDocument> =
  mongoose.models["User"] ??
  mongoose.model<UserDocument>("User", userSchema);

export function toPublicUser(doc: UserDocument) {
  const status = (doc.status ?? "active") as UserStatus;

  return {
    id: String(doc._id),
    fullName: doc.fullName,
    email: doc.email,
    role: doc.role as UserRole,
    status,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt),
    updatedAt:
      doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : String(doc.updatedAt),
  };
}

export function isUserActive(doc: Pick<UserDocument, "status">): boolean {
  return (doc.status ?? "active") === "active";
}
