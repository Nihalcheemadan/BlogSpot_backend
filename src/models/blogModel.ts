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
    imageUrl:{
      type:String, 
      required:true
    },
    author:{
      type : mongoose.Schema.Types.ObjectId,
      ref:'User',
      required:true
    },
    status:{
      type:String, 
      default:'published'
    },
    like: {
      type: [String],
    },
    saved: {
      type: [String],
    },
    reported:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
      }
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref:'User',
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      },
    ],
  },
  {
    timestamps: true,
  }
);

type Blog = InferSchemaType<typeof blogSchema>;
export default model<Blog>("Blog", blogSchema);
