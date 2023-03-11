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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController = __importStar(require("../controller/userController"));
const auth_1 = require("../middleware/auth");
const chatController = __importStar(require("../controller/chatController"));
const router = express_1.default.Router();
//  post requests //
router.route('/signup').post(userController.userSignup);
router.route('/login').post(userController.verifyUser, userController.userLogin);
router.route('/authenticate').post(userController.verifyUser, (req, res) => res.end()); //authenticate user
router.route('/createMail').post(userController.createMail);
router.route('/sendMessage').post(auth_1.Auth, chatController.sendMessage);
// get requests //
router.route('/generateOtp').get(auth_1.localVariables, userController.generateOtp);
router.route('/users/:username').get(userController.getUser);
router.route('/verifyOtp').get(userController.verifyOtp);
router.route('/createResetSession').get(userController.createResetSession);
router.route('/verifySignup').post(userController.verifySignup);
router.route('/getMessages').get(auth_1.Auth, chatController.getMessage);
// put requests // 
router.route('/update').put(auth_1.Auth, userController.updateUser);
router.route('/resetPassword').put(userController.verifyUser, userController.resetPassword);
// delete requests //
router.route("/following/:id").put(auth_1.Auth, userController.userFollowing);
router.get("/getFollowers", userController.followUser);
router.get("/categories", userController.getCategories);
router.get("/userDetails", auth_1.Auth, userController.userDetails);
// router.get("/flw/:id" , Auth , userController.followingPost);
// router.get("/post/user/details/:id" , userController.getUserDetailsforPost);
exports.default = router;
