import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { ROLES } from "@/lib/auth/roles";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: ROLES.map((role) => role.value),
    },
  },
  { timestamps: true },
);

export type UserRecord = InferSchemaType<typeof userSchema>;

export const User: Model<UserRecord> =
  (models.User as Model<UserRecord>) ?? model("User", userSchema);
