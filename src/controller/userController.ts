import { RequestHandler } from "express";
import createHttpError from "http-errors";
import userModel from "../models/userModel";

export const userLogin : RequestHandler = async (req,res,next)=>{
    try {
        // throw Error('Error occured!')
        const user = await userModel.find().exec();
        res.sendStatus(200).json(user);
    } catch (error) {
        next(error)
    }
}

interface userSignupBody{
    name : string,
    email : string,
    phone : string,
    password : string,
    place : string
}

export const userSignup : RequestHandler<unknown,unknown,userSignupBody,unknown> = async (req,res,next) => {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const place = req.body.place;

    try {
        if(!email){
            throw createHttpError(400,"There must be filled the fields")
        }
        const newUser = await userModel.create({
            name,
            email,
            phone,
            password,
            place 
        })
        res.sendStatus(201).json(newUser); 
    } catch (error) {
        next(error)
    }
}