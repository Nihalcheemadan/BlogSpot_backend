import mongoose, { Document, InferSchemaType, model, Schema } from "mongoose";

interface IUser extends Document   {
  username: string;
  email: string;
  password: string;
  status: string;
  isAdmin: boolean;
  Followers: string[];
  Following: string[];
  createdAt: Date;
  updatedAt: Date;
}

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
    profileImg:{
      type:String,
      default:'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg'
    },
    status: {
      type: String,
      default: "unblocked",
    },
    isAdmin: {
      type: String,
      default: false,
    },
    Followers: {
      type: Array,
    },
    Following: {
      type: Array,
    }},
    { timestamps: true }
);

type User = InferSchemaType<typeof userSchema>;
export default model<User>("User", userSchema);
export { IUser };