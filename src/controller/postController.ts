import { RequestHandler } from "express";
import createHttpError,{InternalServerError} from "http-errors";
import blogModel from "../models/blogModel";
import dislikeSchema from "../models/dislikeSchema";
import likeSchema from "../models/likeSchema";

export const toggleAddlikeToPostCtrl : RequestHandler =  (async (req, res) => {
    const { postId } = req.body;
    const logginUser = req.body?.user?._id;
    console.log(logginUser);
    const alreadyDisLike = await dislikeSchema.findOne({
      postId: postId,
      userId: logginUser,
    });
    const alreadyLike = await likeSchema.findOne({
      postId: postId,
      userId: logginUser,
    });
  
    if (alreadyDisLike) {
      await dislikeSchema.findOneAndRemove(postId);
      const post = await likeSchema.create({ postId: postId, userId: logginUser });
  
      res.json(post);
    } else {
      if (alreadyLike) {
        const post = await likeSchema.findOneAndRemove(postId);
        await blogModel.findById(postId, { isLiked: false });
        res.json(post);
      } else {
        const post = await likeSchema.create({ postId: postId, userId: logginUser });
        res.json(post);
      }
    }
});
export const toggleAddDislikeToPostCtrl : RequestHandler =(async (req, res) => {
    const { postId } = req.body;
    const logginUser = req.body?.user?._id;
    const alreadyDisLike = await dislikeSchema.findOne({
      postId: postId,
      userId: logginUser,
    });
    const alreadyLike = await likeSchema.findOne({
      postId: postId,
      userId: logginUser,
    });
  
    if (alreadyLike) {
      await likeSchema.findOneAndRemove(postId);
      const post = await dislikeSchema.create({ postId: postId, userId: logginUser });
      res.json(post);
    } else {
      if (alreadyDisLike) {
        const post = await dislikeSchema.findOneAndRemove(postId);
        await blogModel.findById(postId, { isLiked: false });
        res.json(post);
      } else {
        const post = await dislikeSchema.create({ postId: postId, userId: logginUser });
        res.json(post);
      }
    }
});