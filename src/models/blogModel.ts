import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    like: {
      type: Array,
    },
    dislike: {
      type: Array,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        profile: {
          type: String,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

type Blog = InferSchemaType<typeof blogSchema>;
export default model<Blog>("Blog", blogSchema);
