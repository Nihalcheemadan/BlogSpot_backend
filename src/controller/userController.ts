import { NextFunction, RequestHandler } from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import userModel from "../models/userModel";
import bcrypt from 'bcrypt'
import jwt  from 'jsonwebtoken'
import env from '../utils/validateEnv'
import otpGenerator from 'otp-generator'
import nodemailer from 'nodemailer'
import Mailgen from 'mailgen'

const nodeConfig = {
    host:"smtp.ethereal.email",
    port:587,
    secure:false,
    auth: {
        user:env.NODE_EMAIL,
        pass:env.NODE_PASSWORD
    }
}

const transporter = nodemailer.createTransport(nodeConfig);

const Mailgenerator = new Mailgen({
    theme:'default',
    product:{
        name:"Mailgen",
        link:'https://mailgen.js'
    }
})

interface createMailData{
    userName ?:string,
    userEmail ?:string,
    text ?:string,
    subject ?:string 
}

export const createMail : RequestHandler<unknown,unknown,createMailData,unknown> = (req,res,next) => {
    const { userName , userEmail , text , subject } = req.body;

    //body of email
    const email = {
        body: {
            name:userName,
            intro :text || 'Welcome , Happy to have you on board',
            outro : 'Need help , or have questions? Just replay to this email.'
        }
    }

    const emailBody = Mailgenerator.generate(email);

    const message = {
        from : env.NODE_EMAIL,
        to : userEmail,
        subject : subject || "Signup successfull",
        html : emailBody
    }

    //send mail
    transporter.sendMail(message).then(()=>{
        return res.status(200).json({msg:"You should receive an email from us"})
    }).catch((error)=>{
        throw createHttpError(500,"Error")
    })
}





export const verifyUser : RequestHandler = async (req,res,next) => {
    try {
        const { username } = req.method == "GET" ? req.query : req.body;
        const exist = await userModel.findOne({username}).exec();
        if(!exist) throw createHttpError(404,"Cannot find user");
        next();
    } catch (error) {
        next(error)
    }
}

interface userLoginData{
    email:string,
    password:string
}

export const userLogin : RequestHandler<unknown,unknown,userLoginData,unknown> = async (req,res,next)=>{
    const email = req.body.email;
    const passwordRaw = req.body.password
    try {
        // throw Error('Error occured!')
        const user = await userModel.findOne({email}).exec()
        if(!user){
            throw createHttpError(404,"Email not found")
        }
        bcrypt.compare(passwordRaw,user.password).then(passwordCheck=>{
            if(!passwordCheck){
                throw createHttpError(400,"Password does not match")
            }
            const token = jwt.sign({
                userId:user._id,
                username:user.username
            },env.JWT_SECRET,{expiresIn : "24h"})
            console.log(token);
            res.status(200).json({username:user.username,token,msg:"Login successfull.."});
        })
    } catch (error) {
        next(error)
    }
}

interface userSignupBody{
    username : string,
    email : string,
    phone : string,
    password : string,
    place : string
} 

export const userSignup : RequestHandler<unknown,unknown,userSignupBody,unknown> = async (req,res,next) => {
    const username = req.body.username;
    const email = req.body.email;
    const phone = req.body.phone;
    const passwordRaw = req.body.password;
    const place = req.body.place;

    try {
        if(!email || !username || !phone || !place || !passwordRaw){
            throw createHttpError(400,"Insufficient data")
        }
        const existingUser = await userModel.findOne({email:email}).exec()
        if(existingUser){
            throw createHttpError(409,"Email address is already taken. Please choose another one or log in instead")
        }
        const hashedPassword = await bcrypt.hash(passwordRaw,10);
        const newUser = await userModel.create({
            username,
            email,
            phone,
            password:hashedPassword,
            place 
        })
        res.status(201).json({newUser,msg:"user register successfully"}); 
    } catch (error) {
        next(error)
    }
}

interface getUser{
    userId:string
}

export const getUser:RequestHandler<getUser,unknown,unknown,unknown> = async (req,res,next) => {
    const id = req.params.userId
    try {
        const user = await userModel.findOne({_id:id}).exec()
        if(!user) throw createHttpError(404,"user does not exist ")
        const {password , ...rest} = Object.assign({},user.toJSON());
        res.status(200).json({rest})
    } catch (error) {
        next(error)
    }
}


interface updateUserParams{
    uId:string
}
interface updateUserData {
    username ?: string,
    email ?: string,
    phone ?: string,
    password ?: string,
    place ?: string
}

export const updateUser : RequestHandler<updateUserParams,unknown,updateUserData,unknown> = async(req,res,next)=>{
    const id = req.params.uId;
    const newName = req.body.username;
    const newEmail = req.body.email;
    const newPhone = req.body.phone;
    const newPlace = req.body.place;
    try {

        const { userId }  = res.locals.decodedToken ;
        console.log(userId)
        

        if(!mongoose.isValidObjectId(id)){
            throw createHttpError(400,"Invalid user id")
        }
        if(userId){
        const user = await userModel.updateOne({_id:id},{
            username:newName,
            email:newEmail,
            phone:newPhone,
            place:newPlace
        }).exec()

        if(!user) throw createHttpError(404,"User not found ")
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
        if(!mongoose.isValidObjectId(id)){
            throw createHttpError(400,"Invalid user id")
        }
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
    code: any
}
export const verifyOtp :RequestHandler<unknown,unknown,unknown,verifyQuery> =  (req,res,next) => { 
    const { code } = req.query;
    if(parseInt(req.app.locals.OTP) === parseInt(code)){
        req.app.locals.OTP = null,
        req.app.locals.resetSession = true
        return res.status(201).json({msg:"Verify successfully.."})
    }
    return res.status(400).json({msg:"Invalid OTP"})
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
                    if(error) throw createHttpError(401,"Error occured while hashing")
                    req.app.locals.resetSession = false;
                    res.status(201).json({msg:"Record updated successfully.."})
                })
            }).catch((error)=>{
                throw createHttpError(500).json({msg:"Unable reset the password"})
            })
        }).catch((error)=>{
            throw createHttpError(404,"Username not found")
        })
    } catch (error) {
        next(error)
    }
}

