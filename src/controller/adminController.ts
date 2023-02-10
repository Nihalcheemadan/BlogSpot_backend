import { RequestHandler } from "express";
import createHttpError,{InternalServerError} from "http-errors";
import categoryModel from "../models/categoryModel";
import userModel from "../models/userModel";
import cloudinary  from '../utils/cloudinary'




export const createCategory :RequestHandler = async (req,res,next) => {
    const { imageUrl, category } = req.body;
    try {
        console.log(req.body);
        if(!imageUrl || !category) return next(createHttpError(404,'Insufficient data'));
        const categoryExist = await categoryModel.findOne({category})
        if(categoryExist) return next(createHttpError(404,'Category Already exist'));
        const cat = await categoryModel.create({
            imageUrl, 
            category 
        })
        res.status(201).json({msg:"Category created successfully"})
    } catch (error) {
        next(InternalServerError);  
    } 
} 


