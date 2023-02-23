import { RequestHandler } from "express";
import createHttpError, { InternalServerError } from "http-errors";
import chatModel from "../models/chatSchema";

export const getMessage: RequestHandler = async (req, res, next) => {
    try {
        const {userId} = res.locals.decodedToken;
        const to = req.query.to;
        console.log(userId,to,'logged here');
        
        const messages = await chatModel.find({
            $or: [
                { $and: [{ sender: userId }, { receiver: to }] },
                { $and: [{ sender: to }, { receiver: userId }] }
            ]  
        }) 
        const allMessages = messages.map((msg) => {
            return {
                id:msg._id,
                myself: msg.sender.toString() === userId,
                message: msg.message
            }
        })
        res.status(200).json(allMessages)
    } catch (error) {
        return next(InternalServerError)
    }
}

export const sendMessage: RequestHandler = async (req, res, next) => {
    try {
        const { userId } = res.locals.decodedToken;
        if (!userId) return next(createHttpError(401, "unauthorized user!"))
        const { messages, to } = req.body
        
        const newMessage = new chatModel({
            sender: userId,
            receiver: to,
            message:messages
        })
        newMessage.save()
        res.status(201).json(newMessage)

    } catch (error) {
        return next(InternalServerError)
    }
}