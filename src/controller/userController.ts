import {  NextFunction, Request, RequestHandler, Response } from "express";
import createHttpError from "http-errors";
import mongoose, { InferSchemaType, Model } from "mongoose";
import userModel from "../models/userModel";
import bcrypt from 'bcrypt'
import jwt  from 'jsonwebtoken'
import env from '../utils/validateEnv'
import otpGenerator from 'otp-generator'
import nodemailer from 'nodemailer'



interface createMailData{
    username ?:string,
    userEmail ?:string,
    
}

export const createMail : RequestHandler<unknown,unknown,createMailData,unknown> = async (req,res,next) => {
    const { username, userEmail } = req.body
    const OTP = res.app.locals.OTP;    
    if(!userEmail || !OTP) return next(createHttpError(501, 'Invalid input'));
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        service: 'Gmail',
      
        auth: { 
          user: env.NODE_EMAIL,
          pass: env.NODE_PASSWORD,
        }
      });

      const message = {
        from: env.NODE_EMAIL,
        to: userEmail, 
        subject: "Email verification", // Subject line
        html: "<h2> Hello "+ username +"</h2>"+
        "<h3>OTP for your email verification is </h3>" +
        "<h2 style='font-weight:bold;'>" + OTP +"</h2>"// html body
      }
  
    // send mail with defined transport object
    await transporter.sendMail(message).then((info)=>{
        res.status(201).json({
            message:'Proceed to otp verification',
            info: info.messageId,
            preview: nodemailer.getTestMessageUrl(info)
        })
        
    }).catch((error)=>{ res.send(500).json({error})});
}

export const verifyUser : RequestHandler = async (req,res,next) => {
    try {
        const { username } = req.method == "GET" ? req.query : req.body;
        const exist = await userModel.findOne({username}).exec();
        if(!exist) return next(createHttpError(404,"Cannot find user"))
        next();
    } catch (error) {
        next(error)
    }
}

export const verifySignup= async (req:Request,res:Response,next:NextFunction) => {
    const { username , email } = req.body;
    try {
        const userExist = await userModel.findOne({username}).exec();
        const emailExist = await userModel.findOne({email}).exec();
        if(userExist) return  next(createHttpError(401, "Username already taken"));
        if(emailExist) return next (createHttpError(401, "Email already taken."));
        if(!userExist && !emailExist) return res.status(200).json({msg:"success"})
        return res.status(401) 
    } catch (error) {
        next(error);
    } 
    
}


export const userLogin : RequestHandler = async (req,res,next)=>{
    const username = req.body.username;
    const passwordRaw = req.body.password

    try {
        const user = await userModel.findOne({username})        
        if(!user) return next(createHttpError(404,"User not found"));
        const passwordValidate = await bcrypt.compare(passwordRaw,user.password)
        if(!passwordValidate) return next(createHttpError(404,"Password does not match"));
        const token = jwt.sign({ 
            userId:user._id,  
            username:user.username, 
        },env.JWT_SECRET,{expiresIn : "24h"})
        return res.status(201).send({username:user.username,token,msg:"Login successfull.."});
    } catch (error) { 
        next(error)   
    }
}
interface userSignupBody{
    username : string,
    email : string,
    password : string,
} 
export const userSignup : RequestHandler<unknown,unknown,userSignupBody,unknown> = async (req,res,next) => {
    const username = req.body.username;
    const email = req.body.email;
    const passwordRaw = req.body.password;
    try {
        console.log(req.body);
        if(!email || !username ||  !passwordRaw) return next(createHttpError(400,"Insufficient data"));
        const existingEmail = await userModel.findOne({email }).exec()
        const existingUser = await userModel.findOne({username}).exec()
        if(existingEmail) return next(createHttpError(409,"Email address is already taken. Please choose another one or log in instead"));
        if(existingUser) return next(createHttpError(409,"Username is already taken. Please choose another one or log in instead"))
        const hashedPassword = await bcrypt.hash(passwordRaw,10);
        const newUser = await userModel.create({
            username,
            email,
            password:hashedPassword,
        })        
        return res.status(201).json({newUser,msg:"user register successfully"}); 
    } catch (error) {
        next(error)
    }
}

interface getUser{
    username:string
}

export const getUser:RequestHandler<getUser,unknown,unknown,unknown> = async (req,res,next) => {
    const username = req.params.username
    try {
        const user = await userModel.findOne({username}).exec()
        if(!user) return next(createHttpError(404,"user does not exist "))
        const {password , ...rest} = Object.assign({},user.toJSON());
        res.status(200).json({rest})
    } catch (error) {
        next(error)
    }
}
interface updateUserData {
    username ?: string,
    email ?: string,
    phone ?: string,
    password ?: string,
    place ?: string
}  

export const updateUser : RequestHandler<unknown,unknown,updateUserData,unknown> = async(req,res,next)=>{
    const newName = req.body.username;
    const newEmail = req.body.email;
    const newPhone = req.body.phone;
    const newPlace = req.body.place;
    try {
        const { userId }  = res.locals.decodedToken ;
        console.log(userId)
        if(userId){
        const user = await userModel.updateOne({_id:userId},{
            username:newName,
            email:newEmail,
            phone:newPhone,
            place:newPlace
        }).exec()

        if(!user) return next(createHttpError(404,"User not found "))
        res.status(200).json({msg:"Record updated successfully...."}); 
    }
    } catch (error) {
        next(error)
    }
}

interface deleteUserData{
    id:string
}

export const deleteUser : RequestHandler<deleteUserData,unknown,unknown,unknown> = async (req,res,next) => {
    const id = req.params.id
    try {
        if(!mongoose.isValidObjectId(id)) return next(createHttpError(400,"Invalid user id"))
        const user : any = await userModel.findById(id).exec();
        user.remove()
        res.status(200);
    } catch (error) {
        next(error)
    }
}

export const generateOtp :RequestHandler =  (req,res,next) => {
    req.app.locals.OTP = otpGenerator.generate(6,{ lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false})
    res.status(201).json({code : req.app.locals.OTP})
} 

interface verifyQuery{
    code: string
}
export const verifyOtp :RequestHandler<unknown,unknown,unknown,verifyQuery> =  (req,res,next) => { 
    const { code } = req.query;
    console.log(code);
    console.log(req.app.locals.OTP ,'checking...................................');
    if(!code ) return next(createHttpError(501,'Invalid OTP'));
    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null;
        req.app.locals.resetSession = true;
        return res.status(201).json({msg:"Verify successfully.."})
    }
    return res.status(501).json({msg:"Invalid OTP"})
}

export const createResetSession :RequestHandler = (req,res,next) => {
    if(req.app.locals.resetSession){
        req.app.locals.resetSession = false;  //allow access to this route only once
        return res.status(201).json({msg:"access granted"})
    }
    res.status(440).json({msg:"session expired"})
}

interface resetPasswordData {
    email:string,
    password:string
}
export const resetPassword :RequestHandler<unknown,unknown,resetPasswordData,unknown>  = (req,res, next ) => {
    const { email,password } = req.body;
    if(!req.app.locals.resetSession) return res.status(440).json({msg:"session expired"})
    try {
        userModel.findOne({ email }).exec().then((user : any) =>{
            bcrypt.hash(password, 10).then((hashedPassword) =>{
                userModel.updateOne({email: user.email},{
                    password:hashedPassword
                },function(error : any, data : any){
                    if(error) return next(createHttpError(401,"Error occured while hashing"))
                    req.app.locals.resetSession = false;
                    res.status(201).json({msg:"Record updated successfully.."})
                })
            }).catch((error)=>{
                return next(createHttpError(500).json({msg:"Unable reset the password"}))
            })
        }).catch((error)=>{
            return next(createHttpError(404,"Username not found"))
        })
    } catch (error) {
        next(error)
    }
}