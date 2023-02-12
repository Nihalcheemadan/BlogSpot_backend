import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const dislikeSchema = new Schema({
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


type Dislike = InferSchemaType<typeof dislikeSchema>;
export default model<Dislike>("Dislike",dislikeSchema);