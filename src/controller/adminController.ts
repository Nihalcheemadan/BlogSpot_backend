import { RequestHandler } from "express";
import userModel from "../models/userModel";

export const adminDetails : RequestHandler = async (req,res,next)=>{
    try {
        // throw Error('Error occured!')
        const user = await userModel.find().exec();
        res.sendStatus(200).json(user);
    } catch (error) {
        next(error)
    }
}