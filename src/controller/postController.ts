import { RequestHandler } from "express";
import blogModel from "../models/blogModel";
import userModel from "../models/userModel";
import createHttpError, { InternalServerError } from "http-errors";

//Create Post
export const createBlog: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = res.locals.decodedToken;
    console.log(userId);
    const { title, content, category, imageUrl } = req.body;
    console.log(req.body);
    await new blogModel({
      title,
      content,
      category,
      imageUrl,
      author: userId,
    }).save();
    res.status(200);
  } catch (error) {
    next(InternalServerError);
  }
};

//blockBlog
export const blockBlog: RequestHandler = async (req, res, next) => {
  const id = req.query.id;
  await blogModel
    .findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          status: "blocked",
        },
      }
    )
    .then(() => {
      res.status(200).json({ msg: "user blocked successfully" });
    });
};

//unblockBlog
export const unblockBlog: RequestHandler = async (req, res, next) => {
  const id = req.query.id;
  await blogModel
    .findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          status: "published",
        },
      }
    )
    .then(() => {
      res.status(200).json({ msg: "user blocked successfully" });
    });
};

//reportBlog

export const reportBlog: RequestHandler = async (req, res, next) => {
  const { userId } = res.locals.decodedToken;
  const { id } = req.body;
  try {
    const blog:any = await blogModel.findById(id).populate("reported");
    console.log(blog,'blog gotchhaaaaaaaaaaa');
    if(blog.reported.includes(userId)){
      return next(createHttpError(404,'blog reported already'))
    } 
    await blog.updateOne( {$set:{status:"reported"}},{$push:{reported:userId}})
      await userModel.findByIdAndUpdate(
        { _id: userId },
        {
          $push: {
            reportedBlogs: id,
          }, 
        }
      );
      res.status(200).json({msg:"the blog reported successfully"})
  } catch (error) {
    next(InternalServerError);
  }
  
};

//upload post by one user
export const uploadBlog: RequestHandler = async (req, res) => {
  try {
    const mypost = await blogModel.find({ user: req.params.id });
    if (!mypost) {
      return res.status(200).json("You don't have any post");
    }
    res.status(200).json(mypost);
  } catch (error) {
    res.status(500).json("Internal server error");
  }
};

//update user post
export const updateBlog: RequestHandler = async (req, res) => {
  try {
    const { userId } = res.locals.decodedToken;
    console.log(req.body,'body contentr ');
    
    let post: any = await blogModel.findById(req.body.id);
    if (!post) {
      return res.status(400).json("Post does not found");
    }
    post = await blogModel.findByIdAndUpdate(req.body.id, {
      $set: req.body,
    });
    const updatepost = await post.save();
    res.status(200).json({msg:"blog updated successfully"});
  } catch (error) {
    return res.status(500).json("Internal error occured");
  }
};

//Like
export const likeBlog: RequestHandler = async (req, res) => {
  try {
    const { id } = req.body;
    const { userId } = res.locals.decodedToken;
    const post: any = await blogModel.findById({ _id: id });
    console.log(userId, id);

    if (!post.like.includes(userId)) {
      // if (post.dislike.includes(userId)) {
      //   await post.updateOne({ $pull: { dislike: userId } })
      // }
      await post.updateOne({ $push: { like: userId } });
      return res
        .status(201)
        .json({ post, liked: true, msg: "Post liked successfully" });
    } else {
      await post.updateOne({ $pull: { like: userId } });
      return res.status(200).json({ post, liked: false, msg: "Post unliked" });
    }
  } catch (error) {
    return res.status(500).json("Internal server error ");
  }
};

//save
export const saveBlog: RequestHandler = async (req, res) => {
  try {
    const { id } = req.body;
    const { userId } = res.locals.decodedToken;
    const post: any = await blogModel.findById({ _id: id });
    if (!post.saved.includes(userId)) {
      await post.updateOne({ $push: { saved: userId } });
      await userModel.findByIdAndUpdate(
        { _id: userId },
        {
          $push: {
            savedBlogs: id,
          },
        }
      );
      return res.status(201).json({ post, msg: "Post saved successfully" });
    } else {
      await post.updateOne({ $pull: { saved: userId } });
      return res.status(200).json({ post, msg: "Post unsaved " });
    }
  } catch (error) {
    return res.status(500).json("Internal server error ");
  }
};

// getSingleBlog

export const getSingleBlog: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = res.locals.decodedToken;
    console.log(userId, req.body);
    const blog = await blogModel
      .findById({ _id: req.body.blogId })
      .populate("like")
      .populate("saved");
    console.log(blog);
    if (!blog)
      return next(createHttpError(501, "Blog data can't get right now"));
    let liked = false;
    let saved = false;
    if (blog.like.includes(userId)) {
      liked = true; // update value to true if condition is met
    }
    if (blog.saved.includes(userId)) {
      saved = true; // update value to true if condition is met
    }
    res.status(201).json({ blog, liked, saved });
  } catch (error) {
    next(InternalServerError);
  }
};

//Comment
export const commentBlog: RequestHandler = async (req, res) => {
  try {
    const { userId, username } = res.locals.decodedToken;
    const { comment, postid } = req.body;
    const comments = {
      user: userId,
      username: username,
      comment,
    };
    const post: any = await blogModel.findById(postid);
    post.comments.push(comments);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

export const getComments: RequestHandler = async (req, res, next) => {
  try {
    const id = req.body.id;
    const comments = await blogModel
      .findById({ _id: id })
      .sort({ createdAt: -1 })
      .populate("comments")
      .populate("comments.user")
      
    console.log(comments);
    if (!comments)
      return next(createHttpError(501, "comments can't get right now"));
    res.status(201).json(comments);
  } catch (error) {
    next(InternalServerError);
  }
};

// getUserComment

export const getUserComment: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = res.locals.decodedToken;
    const { id } = req.body;
    console.log(id);
    const blog = await blogModel
      .findById({ _id: id })
      .populate("comments")
      .populate("comments.user");
    console.log(blog);
    if (!blog)
      return next(createHttpError(501, "comments can't get right now"));

    const comments = blog.comments.filter(
      (comment) => comment.user._id.toString() === userId
    );
    console.log(comments);
    res.status(201).json(comments);
  } catch (error) {
    next(InternalServerError);
  }
};

//Delete post
export const deleteBlog: RequestHandler = async (req, res) => {
  try {
    await blogModel.findByIdAndDelete(req.query.id);
    res.status(200).json({msg:"content deleted successfully"})
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

/// Get a Following user
export const getFollowing: RequestHandler = async (req, res) => {
  try {
    const { userId } = res.locals.decodedToken;
    // const following = await userModel.findById(userId).populate("Following");
    const following = await userModel.find({})
    res.status(200).json(following);
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

/// Get a followers list of users
export const getFollowers: RequestHandler = async (req, res) => {
  try { 
    const { userId } = res.locals.decodedToken;
    const following = await userModel.findById(userId).populate("Following");
    res.status(200).json(following);
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};
