import { NextFunction, Request,  Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import env from '../utils/validateEnv'




export const Auth = async (req :Request ,res :Response,next :NextFunction) => {
    try {
        //access authorize header to validate request
        // if (!req.headers.Authorization) return next(createHttpError(401, 'Invalid request!'))
        console.log(req.headers);
        
        const token : string = req.headers.authorization?.split(" ")[1] as string;
        if(!token) throw createHttpError(401,"Authentication failed");
        //retrieve the user details for the logged in user
        const decodedToken = await jwt.verify(token,env.JWT_SECRET) ;
        res.locals.decodedToken = decodedToken;         
        next()
    } catch (error) {
        next(error) 
    }
}

export const localVariables  = (req : Request , res : Response , next : NextFunction)=>{
    req.app.locals = {
        OTP : null,
        resetSession : false
    }
    next()
}