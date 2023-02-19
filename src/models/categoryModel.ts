import { InferSchemaType, model, Schema } from "mongoose";

const categorySchema = new Schema({
    category:{
        type:String,
        required:true,
        unique:true
    },
    imageUrl:{ 
        type:String, 
        required:true
    } 
},{timestamps:true}); 


type Category = InferSchemaType<typeof categorySchema>;
export default model<Category>("Category",categorySchema);