"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("./entities/User");
const posix_1 = __importDefault(require("path/posix"));
const Post_1 = require("./entities/Post");
exports.default = {
    migrations: {
        path: posix_1.default.join(__dirname, "/migrations"),
        pattern: /^[\w-]+\d+.*\.[jt]s$/,
    },
    dbName: "lireddit",
    debug: true,
    type: "postgresql",
    entities: [Post_1.Post, User_1.User],
    allowGlobalContext: true,
};
//# sourceMappingURL=mikro-orm.config.js.map