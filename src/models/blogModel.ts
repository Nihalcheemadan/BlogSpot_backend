import { InferSchemaType, model, Schema } from "mongoose";

const blogSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
    }
},{timestamps:true});


type Blog = InferSchemaType<typeof blogSchema>;
export default model<Blog>("blog",blogSchema);