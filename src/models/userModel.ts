import { InferSchemaType, model, Schema } from "mongoose";

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    place:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
},{timestamps:true});

type User = InferSchemaType<typeof userSchema>;
export default model<User>("User",userSchema);