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
exports.getFollowers = exports.getFollowing = exports.deleteBlog = exports.getUserComment = exports.getComments = exports.commentBlog = exports.getSingleBlog = exports.saveBlog = exports.likeBlog = exports.updateBlog = exports.uploadBlog = exports.reportBlog = exports.unblockBlog = exports.blockBlog = exports.createBlog = void 0;
const blogModel_1 = __importDefault(require("../models/blogModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const http_errors_1 = __importStar(require("http-errors"));
//Create Post
const createBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = res.locals.decodedToken;
        console.log(userId);
        const { title, content, category, imageUrl } = req.body;
        console.log(req.body);
        yield new blogModel_1.default({
            title,
            content,
            category,
            imageUrl,
            author: userId,
        }).save();
        res.status(200);
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.createBlog = createBlog;
//blockBlog
const blockBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    yield blogModel_1.default
        .findByIdAndUpdate({ _id: id }, {
        $set: {
            status: "blocked",
        },
    })
        .then(() => {
        res.status(200).json({ msg: "user blocked successfully" });
    });
});
exports.blockBlog = blockBlog;
//unblockBlog
const unblockBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    yield blogModel_1.default
        .findByIdAndUpdate({ _id: id }, {
        $set: {
            status: "published",
        },
    })
        .then(() => {
        res.status(200).json({ msg: "user blocked successfully" });
    });
});
exports.unblockBlog = unblockBlog;
//reportBlog
const reportBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = res.locals.decodedToken;
    const { id } = req.body;
    try {
        const blog = yield blogModel_1.default.findById(id).populate("reported");
        console.log(blog, 'blog gotchhaaaaaaaaaaa');
        if (blog.reported.includes(userId)) {
            return next((0, http_errors_1.default)(404, 'blog reported already'));
        }
        yield blog.updateOne({ $set: { status: "reported" } }, { $push: { reported: userId } });
        yield userModel_1.default.findByIdAndUpdate({ _id: userId }, {
            $push: {
                reportedBlogs: id,
            },
        });
        res.status(200).json({ msg: "the blog reported successfully" });
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.reportBlog = reportBlog;
//upload post by one user
const uploadBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mypost = yield blogModel_1.default.find({ user: req.params.id });
        if (!mypost) {
            return res.status(200).json("You don't have any post");
        }
        res.status(200).json(mypost);
    }
    catch (error) {
        res.status(500).json("Internal server error");
    }
});
exports.uploadBlog = uploadBlog;
//update user post
const updateBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = res.locals.decodedToken;
        let post = yield blogModel_1.default.findById(req.params.id);
        if (!post) {
            return res.status(400).json("Post does not found");
        }
        post = yield blogModel_1.default.findByIdAndUpdate(req.params.id, {
            $set: req.body,
        });
        const updatepost = yield post.save();
        res.status(200).json(updatepost);
    }
    catch (error) {
        return res.status(500).json("Internal error occured");
    }
});
exports.updateBlog = updateBlog;
//Like
const likeBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const { userId } = res.locals.decodedToken;
        const post = yield blogModel_1.default.findById({ _id: id });
        console.log(userId, id);
        if (!post.like.includes(userId)) {
            // if (post.dislike.includes(userId)) {
            //   await post.updateOne({ $pull: { dislike: userId } })
            // }
            yield post.updateOne({ $push: { like: userId } });
            return res
                .status(201)
                .json({ post, liked: true, msg: "Post liked successfully" });
        }
        else {
            yield post.updateOne({ $pull: { like: userId } });
            return res.status(200).json({ post, liked: false, msg: "Post unliked" });
        }
    }
    catch (error) {
        return res.status(500).json("Internal server error ");
    }
});
exports.likeBlog = likeBlog;
//save
const saveBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const { userId } = res.locals.decodedToken;
        const post = yield blogModel_1.default.findById({ _id: id });
        if (!post.saved.includes(userId)) {
            yield post.updateOne({ $push: { saved: userId } });
            yield userModel_1.default.findByIdAndUpdate({ _id: userId }, {
                $push: {
                    savedBlogs: id,
                },
            });
            return res.status(201).json({ post, msg: "Post saved successfully" });
        }
        else {
            yield post.updateOne({ $pull: { saved: userId } });
            return res.status(200).json({ post, msg: "Post unsaved " });
        }
    }
    catch (error) {
        return res.status(500).json("Internal server error ");
    }
});
exports.saveBlog = saveBlog;
// getSingleBlog
const getSingleBlog = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = res.locals.decodedToken;
        console.log(userId, req.body);
        const blog = yield blogModel_1.default
            .findById({ _id: req.body.blogId })
            .populate("like")
            .populate("saved");
        console.log(blog);
        if (!blog)
            return next((0, http_errors_1.default)(501, "Blog data can't get right now"));
        let liked = false;
        let saved = false;
        if (blog.like.includes(userId)) {
            liked = true; // update value to true if condition is met
        }
        if (blog.saved.includes(userId)) {
            saved = true; // update value to true if condition is met
        }
        res.status(201).json({ blog, liked, saved });
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.getSingleBlog = getSingleBlog;
//Comment
const commentBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, username } = res.locals.decodedToken;
        const { comment, postid } = req.body;
        const comments = {
            user: userId,
            username: username,
            comment,
        };
        const post = yield blogModel_1.default.findById(postid);
        post.comments.push(comments);
        yield post.save();
        res.status(200).json(post);
    }
    catch (error) {
        return res.status(500).json("Internal server error");
    }
});
exports.commentBlog = commentBlog;
const getComments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.body.id;
        const comments = yield blogModel_1.default
            .findById({ _id: id })
            .sort({ createdAt: -1 })
            .populate("comments")
            .populate("comments.user");
        console.log(comments);
        if (!comments)
            return next((0, http_errors_1.default)(501, "comments can't get right now"));
        res.status(201).json(comments);
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.getComments = getComments;
// getUserComment
const getUserComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = res.locals.decodedToken;
        const { id } = req.body;
        console.log(id);
        const blog = yield blogModel_1.default
            .findById({ _id: id })
            .populate("comments")
            .populate("comments.user");
        console.log(blog);
        if (!blog)
            return next((0, http_errors_1.default)(501, "comments can't get right now"));
        const comments = blog.comments.filter((comment) => comment.user._id.toString() === userId);
        console.log(comments);
        res.status(201).json(comments);
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.getUserComment = getUserComment;
//Delete post
const deleteBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield blogModel_1.default.findByIdAndDelete(req.query.id);
        res.status(200).json({ msg: "content deleted successfully" });
    }
    catch (error) {
        return res.status(500).json("Internal server error");
    }
});
exports.deleteBlog = deleteBlog;
/// Get a Following user
const getFollowing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = res.locals.decodedToken;
        const following = yield userModel_1.default.findById(userId).populate("Following");
        res.status(200).json(following);
    }
    catch (error) {
        return res.status(500).json("Internal server error");
    }
});
exports.getFollowing = getFollowing;
/// Get a followers list of users
const getFollowers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = res.locals.decodedToken;
        const following = yield userModel_1.default.findById(userId).populate("Following");
        res.status(200).json(following);
    }
    catch (error) {
        return res.status(500).json("Internal server error");
    }
});
exports.getFollowers = getFollowers;
