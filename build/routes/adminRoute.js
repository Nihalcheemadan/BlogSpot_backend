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
const adminController = __importStar(require("../controller/adminController"));
const router = express_1.default.Router();
router.route('/login').post(adminController.adminLogin);
router.route('/userBlock').get(adminController.userBlock);
router.route('/userUnblock').get(adminController.userUnblock);
router.get('/dashboard', adminController.dashboard);
router.route('/createCategory').post(adminController.createCategory);
router.route('/getCategory').get(adminController.getCategory);
router.route('/editCategory').put(adminController.editCategory);
router.route('/deleteCategory').delete(adminController.deleteCategory);
router.get('/getBlog', adminController.getBlog);
router.route('/createBlog').post(adminController.createBlog);
router.route('/getUsers').get(adminController.getUsers);
exports.default = router;
