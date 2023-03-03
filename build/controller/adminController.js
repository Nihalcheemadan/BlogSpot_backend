"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBlog = exports.getBlog = exports.deleteCategory = exports.editCategory = exports.getCategory = exports.createCategory = exports.getUsers = exports.dashboard = exports.userUnblock = exports.userBlock = exports.adminLogin = void 0;
const http_errors_1 = __importStar(require("http-errors"));
const blogModel_1 = __importDefault(require("../models/blogModel"));
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateEnv_1 = __importDefault(require("../utils/validateEnv"));
//admin login
const adminLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const passwordRaw = req.body.password;
    try {
        const admin = yield userModel_1.default.findOne({
            username: username,
            isAdmin: true,
        });
        if (!admin)
            return next((0, http_errors_1.default)(404, "Enter valid username"));
        const passwordValidate = yield bcrypt_1.default.compare(passwordRaw, admin.password);
        if (!passwordValidate)
            return next((0, http_errors_1.default)(404, "Password does not match"));
        const token = jsonwebtoken_1.default.sign({
            adminId: admin._id,
        }, validateEnv_1.default.JWT_SECRET, { expiresIn: "24h" });
        return res.status(201).send({ token, msg: "Login successfull.." });
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.adminLogin = adminLogin;
const userBlock = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    yield userModel_1.default
        .findByIdAndUpdate({ _id: id }, {
        $set: {
            status: "blocked",
        },
    })
        .then(() => {
        res.status(200).json({ msg: "user blocked successfully" });
    });
});
exports.userBlock = userBlock;
const userUnblock = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    yield userModel_1.default
        .findByIdAndUpdate({ _id: id }, {
        $set: {
            status: "unblocked",
        },
    })
        .then(() => {
        res.status(200).json({ msg: "user blocked successfully" });
    });
});
exports.userUnblock = userUnblock;
//dashboard
const dashboard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModel_1.default.find({}).count();
        const blogs = yield blogModel_1.default.find({}).count();
        res.status(200).json({ users, blogs, msg: "Dashboard updated" });
    }
    catch (error) {
        next(error);
    }
});
exports.dashboard = dashboard;
//get users list
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModel_1.default.find({});
        if (!users)
            return next((0, http_errors_1.default)(501, "Blog data can't get right now"));
        res.status(201).json(users);
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.getUsers = getUsers;
//create a new category
const createCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { imageUrl, category } = req.body;
    try {
        console.log(req.body);
        if (!imageUrl || !category)
            return next((0, http_errors_1.default)(404, "Insufficient data"));
        const categoryExist = yield categoryModel_1.default.findOne({ category });
        if (categoryExist)
            return next((0, http_errors_1.default)(404, "Category Already exist"));
        const cat = yield categoryModel_1.default.create({
            imageUrl,
            category,
        });
        res.status(201).json({ msg: "Category created successfully" });
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.createCategory = createCategory;
//get categories
const getCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield categoryModel_1.default.find({});
        if (!category)
            return next((0, http_errors_1.default)(501, "Blog data can't get right now"));
        res.status(201).json(category);
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.getCategory = getCategory;
//editCategory
const editCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, category, imageUrl } = req.body;
    console.log(req.body);
    try {
        const updatedCategory = yield categoryModel_1.default.findByIdAndUpdate(id, { category, imageUrl }, { new: true });
        if (!updatedCategory) {
            throw (0, http_errors_1.default)(501, "Could not find category");
        }
        res.status(201).json({ msg: "category updated successfully" });
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.editCategory = editCategory;
//deleteCategory
const deleteCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    console.log(req.query);
    try {
        const updatedCategory = yield categoryModel_1.default.findByIdAndDelete(id);
        if (!updatedCategory) {
            throw (0, http_errors_1.default)(501, "Could not find category");
        }
        res.status(201).json({ msg: "category deleted successfully" });
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.deleteCategory = deleteCategory;
//get all the blogs
const getBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blog = yield blogModel_1.default.find({}).sort({ createdAt: -1 }).populate("author");
        console.log(blog);
        if (!blog)
            return next((0, http_errors_1.default)(501, "Blog data can't get right now"));
        res.status(201).json({ blog });
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.getBlog = getBlog;
//create a new blog
const createBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, imageUrl, category } = req.body;
    try {
        console.log(req.body);
        const newBlog = new blogModel_1.default({
            title,
            content,
            category,
            imageUrl,
        }).save();
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.createBlog = createBlog;
