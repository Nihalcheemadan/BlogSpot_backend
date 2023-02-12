import mongoose, { InferSchemaType, model, Schema } from "mongoose";

const commentSchema = new Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        required: [true, 'blogId is required'],
        },
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'User Id is required']
        },
    description: {
        type:String,
        required:[true, 'comment description is required'],
    },
    isEdited:{
        type:Boolean,
        default:false
    },
},
{timestamps:true});


type Comment = InferSchemaType<typeof commentSchema>;
export default model<Comment>("Comment",commentSchema);