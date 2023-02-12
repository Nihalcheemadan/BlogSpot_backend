import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const likeSchema = new Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
},
{timestamps:true});


type Likes = InferSchemaType<typeof likeSchema>;
export default model<Likes>("Likes",likeSchema);