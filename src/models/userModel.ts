import mongoose, { Document, InferSchemaType, model, Schema } from "mongoose";

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  profileImg: string,
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
    profileImg: {
      type: String, 
      default:
        "https://img.freepik.com/premium-vector/men-icon-trendy-avatar-character-cheerful-happy-people-flat-vector-illustration-round-frame-male-portraits-group-team-adorable-guys-isolated-white-background_275421-286.jpg?w=740",
    },
    status: {
      type: String,
      default: "unblocked",
    },
    isAdmin: {
      type: String,
      default: false,
    },
    Followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    Following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],
  },
  { timestamps: true }
);

type User = InferSchemaType<typeof userSchema>;
export default model<User>("User", userSchema);
export { IUser };
