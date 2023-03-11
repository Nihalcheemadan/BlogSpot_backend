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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.followUser = exports.getUserDetailsforPost = exports.followingPost = exports.userDetails = exports.userFollowing = exports.resetPassword = exports.createResetSession = exports.verifyOtp = exports.generateOtp = exports.deleteUser = exports.updateUser = exports.getUser = exports.userSignup = exports.userLogin = exports.unblockUser = exports.blockUser = exports.verifySignup = exports.verifyUser = exports.createMail = void 0;
const http_errors_1 = __importStar(require("http-errors"));
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateEnv_1 = __importDefault(require("../utils/validateEnv"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const blogModel_1 = __importDefault(require("../models/blogModel"));
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const createMail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, userEmail } = req.body;
    const OTP = res.app.locals.OTP;
    if (!userEmail || !OTP)
        return next((0, http_errors_1.default)(501, 'Invalid input'));
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        service: 'Gmail',
        auth: {
            user: validateEnv_1.default.NODE_EMAIL,
            pass: validateEnv_1.default.NODE_PASSWORD,
        }
    });
    const message = {
        from: validateEnv_1.default.NODE_EMAIL,
        to: userEmail,
        subject: "Email verification",
        html: "<h2> Hello " + username + "</h2>" +
            "<h3>OTP for your email verification is </h3>" +
            "<h2 style='font-weight:bold;'>" + OTP + "</h2>" // html body
    };
    // send mail with defined transport object
    yield transporter.sendMail(message).then((info) => {
        res.status(201).json({
            message: 'Proceed to otp verification',
            info: info.messageId,
            preview: nodemailer_1.default.getTestMessageUrl(info)
        });
    }).catch((error) => { res.send(500).json({ error }); });
});
exports.createMail = createMail;
const verifyUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.method == "GET" ? req.query : req.body;
        const exist = yield userModel_1.default.findOne({ username }).exec();
        if (!exist)
            return next((0, http_errors_1.default)(404, "Cannot find user"));
        next();
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.verifyUser = verifyUser;
const verifySignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email } = req.body;
    try {
        const userExist = yield userModel_1.default.findOne({ username }).exec();
        const emailExist = yield userModel_1.default.findOne({ email }).exec();
        if (userExist)
            return next((0, http_errors_1.default)(401, "Username already taken"));
        if (emailExist)
            return next((0, http_errors_1.default)(401, "Email already taken."));
        if (!userExist && !emailExist)
            return res.status(200).json({ msg: "success" });
        return res.status(401);
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.verifySignup = verifySignup;
//block a user 
const blockUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const users = yield userModel_1.default.findByIdAndUpdate({ _id: id }, {
            $set: {
                status: "blocked",
            },
        });
        if (!users)
            return next((0, http_errors_1.default)(501, "user not found"));
        res.status(201).json({ msg: "user blocked" });
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.blockUser = blockUser;
//unblock a user 
const unblockUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const users = yield userModel_1.default.findByIdAndUpdate({ _id: id }, {
            $set: {
                status: "unblocked",
            },
        });
        if (!users)
            return next((0, http_errors_1.default)(501, "user not found"));
        res.status(201).json({ msg: "user blocked" });
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.unblockUser = unblockUser;
const userLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const passwordRaw = req.body.password;
    try {
        const userBlocked = yield userModel_1.default.findOne({ username, status: 'blocked' });
        if (userBlocked)
            return next((0, http_errors_1.default)(403, "User blocked"));
        const user = yield userModel_1.default.findOne({ username, status: 'unblocked' });
        if (!user)
            return next((0, http_errors_1.default)(404, "User not found"));
        const passwordValidate = yield bcrypt_1.default.compare(passwordRaw, user.password);
        if (!passwordValidate)
            return next((0, http_errors_1.default)(404, "Password does not match"));
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            username: user.username,
        }, validateEnv_1.default.JWT_SECRET, { expiresIn: "24h" });
        return res.status(201).send({ username: user.username, token, msg: "Login successfull.." });
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.userLogin = userLogin;
const userSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const email = req.body.email;
    const passwordRaw = req.body.password;
    try {
        if (!email || !username || !passwordRaw)
            return next((0, http_errors_1.default)(400, "Insufficient data"));
        const existingEmail = yield userModel_1.default.findOne({ email }).exec();
        const existingUser = yield userModel_1.default.findOne({ username }).exec();
        if (existingEmail)
            return next((0, http_errors_1.default)(409, "Email address is already taken. Please choose another one or log in instead"));
        if (existingUser)
            return next((0, http_errors_1.default)(409, "Username is already taken. Please choose another one or log in instead"));
        const hashedPassword = yield bcrypt_1.default.hash(passwordRaw, 10);
        const newUser = yield userModel_1.default.create({
            username,
            email,
            password: hashedPassword,
        });
        return res.status(201).json({ msg: "user register successfully" });
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.userSignup = userSignup;
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.params.username;
    try {
        const user = yield userModel_1.default.findOne({ username }).exec();
        if (!user)
            return next((0, http_errors_1.default)(404, "user does not exist "));
        const _a = Object.assign({}, user.toJSON()), { password } = _a, rest = __rest(_a, ["password"]);
        res.status(200).json({ rest });
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.getUser = getUser;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newName = req.body.username;
    const newEmail = req.body.email;
    const newPhone = req.body.phone;
    const newPlace = req.body.place;
    try {
        const { userId } = res.locals.decodedToken;
        console.log(userId);
        if (userId) {
            const user = yield userModel_1.default.updateOne({ _id: userId }, {
                username: newName,
                email: newEmail,
                phone: newPhone,
                place: newPlace
            }).exec();
            if (!user)
                return next((0, http_errors_1.default)(404, "User not found "));
            res.status(200).json({ msg: "Record updated successfully...." });
        }
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        if (!mongoose_1.default.isValidObjectId(id))
            return next((0, http_errors_1.default)(400, "Invalid user id"));
        const user = yield userModel_1.default.findById(id).exec();
        user.remove();
        res.status(200);
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
});
exports.deleteUser = deleteUser;
const generateOtp = (req, res, next) => {
    req.app.locals.OTP = otp_generator_1.default.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    console.log(req.app.locals.OTP);
    res.status(201).json({ code: req.app.locals.OTP });
};
exports.generateOtp = generateOtp;
const verifyOtp = (req, res, next) => {
    const { code } = req.query;
    console.log(code);
    console.log(req.app.locals.OTP, 'checking...................................');
    if (!code)
        return next((0, http_errors_1.default)(501, 'Invalid OTP'));
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null;
        req.app.locals.resetSession = true;
        return res.status(201).json({ msg: "Verify successfully.." });
    }
    return res.status(501).json({ msg: "Invalid OTP" });
};
exports.verifyOtp = verifyOtp;
const createResetSession = (req, res, next) => {
    if (req.app.locals.resetSession) {
        req.app.locals.resetSession = false; //allow access to this route only once
        return res.status(201).json({ msg: "access granted" });
    }
    res.status(440).json({ msg: "session expired" });
};
exports.createResetSession = createResetSession;
const resetPassword = (req, res, next) => {
    const { email, password } = req.body;
    if (!req.app.locals.resetSession)
        return res.status(440).json({ msg: "session expired" });
    try {
        userModel_1.default.findOne({ email }).exec().then((user) => {
            bcrypt_1.default.hash(password, 10).then((hashedPassword) => {
                userModel_1.default.updateOne({ email: user.email }, {
                    password: hashedPassword
                }, function (error, data) {
                    if (error)
                        return next((0, http_errors_1.default)(401, "Error occured while hashing"));
                    req.app.locals.resetSession = false;
                    res.status(201).json({ msg: "Record updated successfully.." });
                });
            }).catch((error) => {
                return next((0, http_errors_1.default)(500).json({ msg: "Unable reset the password" }));
            });
        }).catch((error) => {
            return next((0, http_errors_1.default)(404, "Username not found"));
        });
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
};
exports.resetPassword = resetPassword;
//Following
exports.userFollowing = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.params.id, 'params modified');
    const { userId } = res.locals.decodedToken;
    const id = req.params.id;
    if (id !== userId) {
        const user = yield userModel_1.default.findById(userId);
        const otheruser = yield userModel_1.default.findById(id);
        if (!user.Following.includes(id)) {
            yield user.updateOne({ $push: { Following: id } });
            yield otheruser.updateOne({ $push: { Followers: userId } });
            return res.status(200).json("User has followed");
        }
        else {
            yield user.updateOne({ $pull: { Following: id } });
            yield otheruser.updateOne({ $pull: { Followers: userId } });
            return res.status(201).json("User has Unfollowed");
        }
    }
    else {
        return res.status(400).json("You can't follow yourself");
    }
}));
//userDetails
const userDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.query.id, 'params modified');
    const id = req.query.id;
    if (!id)
        next((0, http_errors_1.default)(404, 'User not found'));
    try {
        const user = yield userModel_1.default
            .findById(id)
            .populate({ path: 'Followers', select: 'username' })
            .populate({ path: 'Following', select: 'username' })
            .populate({ path: 'savedBlogs' })
            .exec();
        const followersCount = user.Followers.length;
        const followingCount = user.Following.length;
        const article = user.savedBlogs;
        const blog = yield blogModel_1.default.find({ author: id });
        res.status(200).json({ blog, article, user, followersCount, followingCount });
    }
    catch (error) {
        console.error(error);
        next((0, http_errors_1.default)(500, 'Internal server error'));
    }
});
exports.userDetails = userDetails;
//Fetch post from following
exports.followingPost = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.params.id);
        const followersPost = yield Promise.all(user.Following.map((item) => {
            return blogModel_1.default.find({ user: item });
        }));
        const userPost = yield blogModel_1.default.find({ user: user._id });
        res.status(200).json(userPost.concat(...followersPost));
    }
    catch (error) {
        return res.status(500).json("Internal server error");
    }
}));
//get user details for post
exports.getUserDetailsforPost = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.params.id);
        if (!user) {
            return res.status(400).json("User not found");
        }
        const _b = user._doc, { email, password, phonenumber } = _b, others = __rest(_b, ["email", "password", "phonenumber"]);
        res.status(200).json(others);
    }
    catch (error) {
        return res.status(500).json("Internal server error");
    }
}));
//get user to follow
exports.followUser = ((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.query;
        res.status(200).json();
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
}));
//getCategories
exports.getCategories = ((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield categoryModel_1.default.find({});
        if (!categories)
            return next((0, http_errors_1.default)(501, "categories not found"));
        res.status(200).json(categories);
    }
    catch (error) {
        next(http_errors_1.InternalServerError);
    }
}));
