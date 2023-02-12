import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "unblocked",
    },
    isAdmin: {
      type: String,
      default: false,
    },
    postCount: {
        type: Number,
        default: 0,
    },
    isFollowing: {
        type: Boolean,
        default: false,
    },
    isUnfollowing: {
        type: Boolean,
        default: false,
    },
    viewedBy: {
        type: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    },
    followers: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    following: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    },
    { timestamps: true }
);

type User = InferSchemaType<typeof userSchema>;
export default model<User>("User", userSchema);
