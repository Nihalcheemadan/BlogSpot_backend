import { RequestHandler } from "express";
import createHttpError, { InternalServerError } from "http-errors";
import blogModel from "../models/blogModel";
import categoryModel from "../models/categoryModel";
import userModel from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../utils/validateEnv";

//admin login

export const adminLogin: RequestHandler = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const admin:any = await userModel.findOne({
      username:username,
      isAdmin:true
    });
    if (!admin) return next(createHttpError(404, "Enter valid username"));
    const passwordValidate = await bcrypt.compare(password, admin.password);
    if (!passwordValidate) return next(createHttpError(404, "Password does not match"));
    const token = jwt.sign(
      { adminId: admin._id },
      env.JWT_SECRET,
      { expiresIn: "24h" },
      (error, token) => {
        if (error) return next(createHttpError(500, "Failed to generate token"));
        res.status(201).send({ token, msg: "Login successful" });
      }
    );
  } catch (error) {
    next(InternalServerError);
  }
};

export const verifyAdmin : RequestHandler = async (req,res,next) => {
  try {
      const { adminId }  = res.locals.decodedToken ;
      const admin = await userModel.findById(adminId)
      res.status(200).json(admin);
  } catch (error) {
      next(InternalServerError) 
  }
}


export const userBlock: RequestHandler = async (req, res, next) => {
  const id = req.query.id;
  await userModel
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

export const userUnblock: RequestHandler = async (req, res, next) => {
  const id = req.query.id;
  await userModel
    .findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          status: "unblocked",
        },
      }
    )
    .then(() => {
      res.status(200).json({ msg: "user blocked successfully" });
    });
};

//dashboard

export const dashboard: RequestHandler = async (req, res, next) => {
  try {
    const users = await userModel.find({}).count();
    const blogs = await blogModel.find({}).count();
    res.status(200).json({users,blogs,msg:"Dashboard updated"})
  } catch (error) {
    next(error);
  }
};


//get users list

export const getUsers: RequestHandler = async (req, res, next) => {
  try {
    const users = await userModel.find({});
    if (!users)
      return next(createHttpError(501, "Blog data can't get right now"));
    res.status(201).json(users);
  } catch (error) {
    next(InternalServerError);
  }
};

//create a new category

export const createCategory: RequestHandler = async (req, res, next) => {
  const { imageUrl, category } = req.body;
  try {
    console.log(req.body);
    if (!imageUrl || !category)
      return next(createHttpError(404, "Insufficient data"));
    const categoryExist = await categoryModel.findOne({ category });
    if (categoryExist)
      return next(createHttpError(404, "Category Already exist"));
    const cat = await categoryModel.create({
      imageUrl,
      category,
    });
    res.status(201).json({ msg: "Category created successfully" });
  } catch (error) {
    next(InternalServerError);
  }
};

//get categories

export const getCategory: RequestHandler = async (req, res, next) => {
  try {
    const category = await categoryModel.find({});
    if (!category) return next(createHttpError(501, "Blog data can't get right now"));
    res.status(201).json(category);
  } catch (error) {
    next(InternalServerError);
  }
};

//editCategory 

export const editCategory: RequestHandler = async (req, res, next) => {
  const { id, category, imageUrl } = req.body;
  console.log(req.body); 

  try {
    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      { category, imageUrl },
      { new: true }
    );
    if (!updatedCategory) {
      throw createHttpError(501, "Could not find category");
    }

    res.status(201).json({ msg: "category updated successfully" });
  } catch (error) {
    next(InternalServerError);
  }
};

//deleteCategory

export const deleteCategory: RequestHandler = async (req, res, next) => {
  const { id } = req.query;
  console.log(req.query);
  try {
    const updatedCategory = await categoryModel.findByIdAndDelete(id)
    if (!updatedCategory) {
      throw createHttpError(501, "Could not find category");
    }
    res.status(201).json({ msg: "category deleted successfully" });
  } catch (error) {
    next(InternalServerError);
  }
};

//get all the blogs
export const getBlog: RequestHandler = async (req, res, next) => {
  try {

    const blog = await blogModel.find({}).sort({ createdAt: -1 }).populate("author").populate('reported')
    // const reportedUsers = await blogModel.find().populate('reported.user')
    // const reportedUsers = await blogModel.find({})
    if (!blog) return next(createHttpError(501, "Blog data can't get right now"));
    // console.log(reportedUsers,'blog users')
    console.log(blog,'blog other than reported')
    // const reportedUsers :any = blog.reported
    res.status(201).json({ blog });
  } catch (error) {
    next(InternalServerError);
  }
}

//reportManagement

export const reportManagement: RequestHandler = async (req, res, next) => {

  console.log(req.body.id,'reqj boduuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu');
  
  try {
    const reportedUsers = await blogModel.findById(req.body.id).populate('reported').populate('reported.user')
    if (!reportedUsers) return next(createHttpError(501, "Blog data can't get right now"));
    console.log(reportedUsers,'blog other than reported')
    res.status(201).json({ reportedUsers });
  } catch (error) {
    next(InternalServerError);
  }
}


//create a new blog

export const createBlog: RequestHandler = async (req, res, next) => {
  const { title, content, imageUrl, category } = req.body;
  try {
    console.log(req.body);
    const newBlog = new blogModel({
      title,
      content,
      category,
      imageUrl,
    }).save();
  } catch (error) {
    next(InternalServerError);
  }
};
