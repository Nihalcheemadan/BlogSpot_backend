"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable @typescript-eslint/no-var-requires */
const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECURITY_KEY,
});
const cloudinaryUploadImg = (fileTOUpload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield cloudinary.uploader.upload(fileTOUpload, {
            resource_type: "auto",
        });
        return {
            url: data === null || data === void 0 ? void 0 : data.secure_url,
        };
    }
    catch (error) {
        return error;
    }
});
module.exports = cloudinaryUploadImg;
