import mongoose,{ InferSchemaType, model, Schema } from "mongoose";


const blogSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    category:{
        type: String,
        
        required:true
    },
    isLiked:{
        type:Boolean,
        default:false,
    },
    isDisLiked:{
        type:Boolean,
        default:false,
    },
    // user:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'User',
    //     required:[true,"Please Author is required"]
    // },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
        },
    ],
    disLikes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
        },
    ], 
    imageUrl:{
        type:String,
    } 
},{
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals:true,
    }, 
    timestamps:true
});


blogSchema.virtual("Likes", {
    ref:"Likes",
    foreignField:"postId",
    localField:"_id"
}) 

blogSchema.virtual("Dislike", {
    ref:"Dislike",
    foreignField:"postId",
    localField:"_id"
})

blogSchema.virtual("Comment", {
    ref:"Comment",
    foreignField:"postId",
    localField:"_id"
})


type Blog = InferSchemaType<typeof blogSchema>;
export default model<Blog>("Blog",blogSchema);