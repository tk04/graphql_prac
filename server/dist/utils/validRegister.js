"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validRegister = void 0;
const validRegister = (options) => {
    if (options.username.length <= 2) {
        return [
            {
                field: "username",
                message: "username must be at least 3 characters",
            },
        ];
    }
    if (options.username.includes("@")) {
        return [
            {
                field: "username",
                message: "username cannot include an @",
            },
        ];
    }
    if (options.email.includes("@")) {
        return [
            {
                field: "email",
                message: "invalid email",
            },
        ];
    }
    if (options.password.length < 3) {
        return [
            {
                field: "password",
                message: "password must be at least 3 characters",
            },
        ];
    }
    return null;
};
exports.validRegister = validRegister;
//# sourceMappingURL=validRegister.js.map