"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const envalid_1 = require("envalid");
exports.default = (0, envalid_1.cleanEnv)(process.env, {
    MONGO_CONNECTION: (0, envalid_1.str)(),
    PORT: (0, envalid_1.port)(),
    JWT_SECRET: (0, envalid_1.str)(),
    NODE_EMAIL: (0, envalid_1.str)(),
    NODE_PASSWORD: (0, envalid_1.str)(),
});
