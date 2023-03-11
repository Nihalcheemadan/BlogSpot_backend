"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const chatSchema = new mongoose_1.Schema({
    sender: { type: mongoose_1.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose_1.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Chat", chatSchema);
