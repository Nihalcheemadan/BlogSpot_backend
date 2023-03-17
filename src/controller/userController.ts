import { NextFunction, Request, RequestHandler, Response } from "express";
import createHttpError, { InternalServerError } from "http-errors";
import mongoose, { InferSchemaType, Model } from "mongoose";
import userModel, { IUser } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../utils/validateEnv";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import blogModel from "../models/blogModel";
import categoryModel from "../models/categoryModel";

interface createMailData {
  username?: string;
  userEmail?: string;
}

export const createMail: RequestHandler<
  unknown,
  unknown,
  createMailData,
  unknown
> = async (req, res, next) => {
  const { username, userEmail } = req.body;
  const OTP = res.app.locals.OTP;
  if (!userEmail || !OTP) return next(createHttpError(501, "Invalid input"));
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: "Gmail",
    auth: {
      user: env.NODE_EMAIL,
      pass: env.NODE_PASSWORD,
    },
  });

  const message = {
    from: env.NODE_EMAIL,
    to: userEmail,
    subject: "Email verification", // Subject line
    html:
      "<h2> Hello " +
      username +
      "</h2>" +
      "<h3>OTP for your email verification is </h3>" +
      "<h2 style='font-weight:bold;'>" +
      OTP +
      "</h2>", // html body
  };

  // send mail with defined transport object
  await transporter
    .sendMail(message)
    .then((info) => {
      res.status(201).json({
        message: "Proceed to otp verification",
        info: info.messageId,
        preview: nodemailer.getTestMessageUrl(info),
      });
    })
    .catch((error) => {
      res.send(500).json({ error });
    });
};

export const verifyUser: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = res.locals.decodedToken;
    const user = await userModel.findById(userId);
    res.status(200).json(user);
  } catch (error) {
    next(InternalServerError);
  }
};

export const verifySignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email } = req.body;
  try {
    const userExist = await userModel.findOne({ username }).exec();
    const emailExist = await userModel.findOne({ email }).exec();
    if (userExist) return next(createHttpError(401, "Username already taken"));
    if (emailExist) return next(createHttpError(401, "Email already taken."));
    if (!userExist && !emailExist)
      return res.status(200).json({ msg: "success" });
    return res.status(401);
  } catch (error) {
    next(InternalServerError);
  }
};

//block a user

export const blockUser: RequestHandler = async (req, res, next) => {
  const id = req.params.id;
  try {
    const users = await userModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          status: "blocked",
        },
      }
    );
    if (!users) return next(createHttpError(501, "user not found"));
    res.status(201).json({ msg: "user blocked" });
  } catch (error) {
    next(InternalServerError);
  }
};

//unblock a user

export const unblockUser: RequestHandler = async (req, res, next) => {
  const id = req.params.id;
  try {
    const users = await userModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          status: "unblocked",
        },
      }
    );
    if (!users) return next(createHttpError(501, "user not found"));
    res.status(201).json({ msg: "user blocked" });
  } catch (error) {
    next(InternalServerError);
  }
};

export const userLogin: RequestHandler = async (req, res, next) => {
  const username = req.body.username;
  const passwordRaw = req.body.password;
  try {
    const userBlocked = await userModel.findOne({
      username,
      status: "blocked",
    });
    if (userBlocked) return next(createHttpError(403, "User blocked"));
    const user = await userModel.findOne({ username, status: "unblocked" });
    if (!user) return next(createHttpError(404, "User not found"));
    const passwordValidate = await bcrypt.compare(passwordRaw, user.password);
    if (!passwordValidate)
      return next(createHttpError(404, "Password does not match"));
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    return res
      .status(201)
      .send({ username: user.username, token, msg: "Login successfull.." });
  } catch (error) {
    next(InternalServerError);
  }
};

interface userSignupBody {
  username: string;
  email: string;
  password: string;
}

export const userSignup: RequestHandler<
  unknown,
  unknown,
  userSignupBody,
  unknown
> = async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const passwordRaw = req.body.password;
  try {
    if (!email || !username || !passwordRaw)
      return next(createHttpError(400, "Insufficient data"));
    const existingEmail = await userModel.findOne({ email }).exec();
    const existingUser = await userModel.findOne({ username }).exec();
    if (existingEmail)
      return next(
        createHttpError(
          409,
          "Email address is already taken. Please choose another one or log in instead"
        )
      );
    if (existingUser)
      return next(
        createHttpError(
          409,
          "Username is already taken. Please choose another one or log in instead"
        )
      );
    const hashedPassword = await bcrypt.hash(passwordRaw, 10);
    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({ msg: "user register successfully" });
  } catch (error) {
    next(InternalServerError);
  }
};

interface getUser {
  username: string;
}

export const getUser: RequestHandler<
  getUser,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const username = req.params.username;
  try {
    const user = await userModel.findOne({ username }).exec();
    if (!user) return next(createHttpError(404, "user does not exist "));
    const { password, ...rest } = Object.assign({}, user.toJSON());
    res.status(200).json({ rest });
  } catch (error) {
    next(InternalServerError);
  }
};

interface updateUserData {
  about?: string;
  address?: string;
  profileImg?: string;
  country?: string;
}

export const updateUser: RequestHandler<
  unknown,
  unknown,
  updateUserData,
  unknown
> = async (req, res, next) => {
  const { about, address, profileImg, country } = req.body;
  console.log(req.body);

  try {
    const { userId } = res.locals.decodedToken;
    console.log(userId);
    if (userId) {
      const user = await userModel
        .updateOne(
          { _id: userId },
          {
            about,
            address,
            profileImg,
            country,
          }
        )
        .exec();
      if (!user) return next(createHttpError(404, "User not found "));
      res.status(200).json({ msg: "Record updated successfully...." });
    }
  } catch (error) {
    next(InternalServerError);
  }
};

//premiumUser

export const premiumUser: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = res.locals.decodedToken;
    console.log(userId);
    if (userId) {
      const user = await userModel.updateOne(
        { _id: userId },
        {
          $set: {
            isPremiumUser: true,
          },
        }
      );
      if (!user) return next(createHttpError(404, "User not found "));
      res.status(200).json({ msg: "Record updated successfully...." });
    }
  } catch (error) {
    next(InternalServerError);
  }
};

export const updateGallery: RequestHandler = async (req, res, next) => {
  const { imageUrl } = req.body;
  try {
    const { userId } = res.locals.decodedToken;
    if (userId) {
      const gallery = await userModel.findOne({ userId });

      if (!gallery) {
        const newgallery = new userModel({
          gallery: imageUrl,
        });
        await newgallery.save();
      } else {
        await userModel.findOneAndUpdate(
          { userId },
          {
            $addToSet: { gallery: imageUrl },
          }
        );
      }
      if (!gallery) return next(createHttpError(404, "Something went wrong"));
      res.status(200).json({ msg: "Record updated successfully...." });
    }
  } catch (error) {
    next(InternalServerError);
  }
};

//galleryDelete

export const galleryDelete: RequestHandler = async (req, res, next) => {
  const { url } = req.body;
  console.log(url);
  try {
    const { userId } = res.locals.decodedToken;
    if (userId) {
      const user = await userModel.findOne({ userId });
      if (!user) return next(createHttpError(404, "Something went wrong"));
      if (user.gallery.includes(url)) {
        await userModel.updateOne({ userId }, { $pull: { gallery: url } });
      }
      res.status(200).json({ msg: "Record deleted successfully...." });
    }
  } catch (error) {
    next(InternalServerError);
  }
};

interface deleteUserData {
  id: string;
}

export const deleteUser: RequestHandler<
  deleteUserData,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const id = req.params.id;
  try {
    if (!mongoose.isValidObjectId(id))
      return next(createHttpError(400, "Invalid user id"));
    const user: any = await userModel.findById(id).exec();
    user.remove();
    res.status(200);
  } catch (error) {
    next(InternalServerError);
  }
};

export const generateOtp: RequestHandler = (req, res, next) => {
  req.app.locals.OTP = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  console.log(req.app.locals.OTP);
  res.status(201).json({ code: req.app.locals.OTP });
};

interface verifyQuery {
  code: string;
}
export const verifyOtp: RequestHandler<
  unknown,
  unknown,
  unknown,
  verifyQuery
> = (req, res, next) => {
  const { code } = req.query;
  console.log(code);
  console.log(
    req.app.locals.OTP,
    "checking..................................."
  );
  if (!code) return next(createHttpError(501, "Invalid OTP"));
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null;
    req.app.locals.resetSession = true;
    return res.status(201).json({ msg: "Verify successfully.." });
  }
  return res.status(501).json({ msg: "Invalid OTP" });
};

export const createResetSession: RequestHandler = (req, res, next) => {
  if (req.app.locals.resetSession) {
    req.app.locals.resetSession = false; //allow access to this route only once
    return res.status(201).json({ msg: "access granted" });
  }
  res.status(440).json({ msg: "session expired" });
};

interface resetPasswordData {
  email: string;
  password: string;
}
export const resetPassword: RequestHandler<
  unknown,
  unknown,
  resetPasswordData,
  unknown
> = (req, res, next) => {
  const { email, password } = req.body;
  if (!req.app.locals.resetSession)
    return res.status(440).json({ msg: "session expired" });
  try {
    userModel
      .findOne({ email })
      .exec()
      .then((user: any) => {
        bcrypt
          .hash(password, 10)
          .then((hashedPassword) => {
            userModel.updateOne(
              { email: user.email },
              {
                password: hashedPassword,
              },
              function (error: any, data: any) {
                if (error)
                  return next(
                    createHttpError(401, "Error occured while hashing")
                  );
                req.app.locals.resetSession = false;
                res.status(201).json({ msg: "Record updated successfully.." });
              }
            );
          })
          .catch((error) => {
            return next(
              createHttpError(500).json({ msg: "Unable reset the password" })
            );
          });
      })
      .catch((error) => {
        return next(createHttpError(404, "Username not found"));
      });
  } catch (error) {
    next(InternalServerError);
  }
};

//Following

export const userFollowing: RequestHandler = async (req, res) => {
  console.log(req.params.id, "params modified");
  const { userId } = res.locals.decodedToken;
  const id = req.params.id;

  if (id !== userId) {
    // Check if the user is a premium user
    const user: any = await userModel.findById(userId);

    if (user.isPremiumUser === true) {
      // If the user is a premium user, skip the following count limit and check if the user is already following
      const alreadyFollowing = user.Following.includes(id);
      if (alreadyFollowing) {
        await user.updateOne({ $pull: { Following: id } });
        const otheruser: any = await userModel.findById(id);
        await otheruser.updateOne({ $pull: { Followers: userId } });
        return res.status(201).json("User has Unfollowed");
      } else {
        await user.updateOne({ $push: { Following: id } });
        const otheruser: any = await userModel.findById(id);
        await otheruser.updateOne({ $push: { Followers: userId } });
        return res.status(200).json("User has followed");
      }
    } else {
      // If the user is not a premium user, apply the following count limit and check if the user is already following
      const followingCount = user.Following.length;
      const alreadyFollowing = user.Following.includes(id);

      if (followingCount < 25 && !alreadyFollowing) {
        await user.updateOne({ $push: { Following: id } });
        const otheruser: any = await userModel.findById(id);
        await otheruser.updateOne({ $push: { Followers: userId } });
        return res.status(200).json("User has followed");
      } else if (alreadyFollowing) {
        await user.updateOne({ $pull: { Following: id } });
        const otheruser: any = await userModel.findById(id);
        await otheruser.updateOne({ $pull: { Followers: userId } });
        return res.status(201).json("User has Unfollowed");
      } else {
        return res.status(400).json("Following list has exceeded 10");
      }
    }
  } else {
    return res.status(400).json("You can't follow yourself");
  }
};

//userDetails

export const userDetails: RequestHandler = async (req, res, next) => {
  console.log(req.query.id, "params modified");
  const id = req.query.id;
  if (!id) next(createHttpError(404, "User not found"));

  try {
    const user: any = await userModel
      .findById(id)
      .populate("Followers")
      .populate("Following")
      .populate({ path: "savedBlogs" })
      .exec();
    const followers = user.Followers;
    const following = user.Following;
    const gallery = user.gallery;
    const article = user.savedBlogs;

    const blog = await blogModel.find({ author: id });
    res
      .status(200)
      .json({ blog, article, user, followers, following, gallery });
  } catch (error) {
    console.error(error);
    next(createHttpError(500, "Internal server error"));
  }
};

//Fetch post from following
export const followingPost: RequestHandler = async (req, res) => {
  try {
    const user: any = await userModel.findById(req.params.id);
    const followersPost = await Promise.all(
      user.Following.map((item: any) => {
        return blogModel.find({ user: item });
      })
    );
    const userPost = await blogModel.find({ user: user._id });

    res.status(200).json(userPost.concat(...followersPost));
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

//get user details for post
export const getUserDetailsforPost: RequestHandler = async (req, res) => {
  try {
    const user: any = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(400).json("User not found");
    }
    const { email, password, phonenumber, ...others } = user._doc;
    res.status(200).json(others);
  } catch (error) {
    return res.status(500).json("Internal server error");
  }
};

//get user to follow

export const followUser: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.query;
    res.status(200).json();
  } catch (error) {
    next(InternalServerError);
  }
};

//getCategories
export const getCategories: RequestHandler = async (req, res, next) => {
  try {
    const categories = await categoryModel.find({});
    if (!categories) return next(createHttpError(501, "categories not found"));
    res.status(200).json(categories);
  } catch (error) {
    next(InternalServerError);
  }
};

export const getBlog: RequestHandler = async (req, res, next) => {
  try {
    // const { userId } = res.locals.decodedToken;

    const blog = await blogModel
      .find({})
      .sort({ createdAt: -1 })
      .populate("author");
    if (!blog)
      return next(createHttpError(501, "Blog data can't get right now"));

    // const followingBlog :any = await userModel.findById({_id:userId}).populate({ path: 'Following', populate: { path: 'savedBlogs'} });
    // console.log(followingBlog,'itttttttttttttttttttttttttttttttttttttttt')
    // const blogs = followingBlog.Following
    // console.log(blogs,'b...........................................................');

    res.status(201).json({ blog });
  } catch (error) {
    next(InternalServerError);
  }
};
