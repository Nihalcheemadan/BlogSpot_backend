import { RequestHandler } from "express";
import createHttpError,{InternalServerError} from "http-errors";
import blogModel from "../models/blogModel";
import categoryModel from "../models/categoryModel";
import userModel from "../models/userModel";
import bcrypt from 'bcrypt'
import jwt  from 'jsonwebtoken'
import env from '../utils/validateEnv'


//admin login

export const adminLogin : RequestHandler = async (req,res,next)=>{    
    const username = req.body.username;
    const passwordRaw = req.body.password
    try {
        const admin = await userModel.findOne({ username: username, isAdmin: true })        
        if(!admin) return next(createHttpError(404,"Enter valid username"));
        const passwordValidate = await bcrypt.compare(passwordRaw,admin.password)
        if(!passwordValidate) return next(createHttpError(404,"Password does not match"));
        const token = jwt.sign({ 
            adminId:admin._id,  
        },env.JWT_SECRET,{expiresIn : "24h"})
        return res.status(201).send({token,msg:"Login successfull.."});
    } catch (error) { 
        next(InternalServerError)   
    }
}


//get users list

export const getUsers : RequestHandler = async (req,res,next) => {
    try {
        const users = await userModel.find({});
        if(!users) return next(createHttpError(501,"Blog data can't get right now"));
        res.status(201).json(users);
    } catch (error) {
        next(InternalServerError);
    }
} 


//create a new category 

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


//get categories

export const getCategory : RequestHandler = async (req,res,next) => {
    try {
        const category = await categoryModel.find({});
        if(!category) return next(createHttpError(501,"Blog data can't get right now"));
        res.status(201).json(category) 
    } catch (error) {
        next(InternalServerError)
    }
} 


//get all the blogs 
export const getBlog : RequestHandler = async (req,res,next) => {
    try {
        const blog = await blogModel.find();
        if(!blog) return next(createHttpError(501,"Blog data can't get right now"));
        res.status(201).json(blog)
    } catch (error) {
        next(InternalServerError)
    }
}


//create a new blog 

export const createBlog : RequestHandler = async (req,res,next) => {
    const { title,content,imageUrl,category } = req.body
    try {
        console.log(req.body);
        const newBlog = new blogModel({
            title,
            content,
            category,
            imageUrl
        }).save();
    } catch (error) { 
        next(InternalServerError)
    }  
}


