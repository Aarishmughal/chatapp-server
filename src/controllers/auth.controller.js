const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const User = require("../models/user.model");
const handleAsync = require("../utils/handleAsync");
const AppError = require("../utils/AppError");

const signToken = (id, type) => {
    return jwt.sign(
        { id },
        type === "access"
            ? process.env.ACCESS_TOKEN_SECRET
            : process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:
                type === "access"
                    ? process.env.ACCESS_TOKEN_LIFETIME
                    : process.env.REFRESH_TOKEN_LIFETIME,
        }
    );
};

const verifyToken = (token, type) => {
    return promisify(jwt.verify)(
        token,
        type === "access"
            ? process.env.ACCESS_TOKEN_SECRET
            : process.env.REFRESH_TOKEN_SECRET
    );
};

const setupCookies = (res, user, isLogout) => {
    let accessToken, refreshToken;
    if (isLogout) {
        accessToken = "loggedout";
        refreshToken = "loggedout";
    } else {
        accessToken = signToken(user._id, "access");
        refreshToken = signToken(user._id, "refresh");
    }

    const baseCookie = {
        httpOnly: true,
        path: "/",
        sameSite: "none",
        secure: true,
    };

    res.cookie("accessToken", accessToken, {
        ...baseCookie,
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
        ...baseCookie,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
};

exports.signup = handleAsync(async (req, res, next) => {
    const { username, email, password, passwordConfirm } = req.body;

    try {
        // Create user - this can throw validation errors
        const user = await User.create({
            username,
            email,
            password,
            passwordConfirm,
        });

        // Only setup cookies after successful user creation
        setupCookies(res, user, false);

        res.status(201).json({
            status: "success",
            message: "User signed up successfully",
        });
    } catch (error) {
        // Don't set cookies if user creation fails
        return next(error);
    }
});

exports.login = handleAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.checkPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401));
    }

    setupCookies(res, user, false);

    res.status(200).json({
        status: "success",
        message: "User logged in successfully",
    });
});

exports.logout = (req, res) => {
    setupCookies(res, null, true);

    res.status(200).json({
        status: "success",
        message: "User logged out successfully",
    });
};

// Protects using Access Token
exports.protect = handleAsync(async (req, res, next) => {
    let token;
    if (
        req.cookies &&
        req.cookies.accessToken &&
        req.cookies.accessToken !== "loggedout"
    ) {
        token = req.cookies.accessToken;
    }
    if (!token) {
        return next(
            new AppError(
                "You are not logged in! Please log in to get access",
                401
            )
        );
    }

    const decoded = await verifyToken(token, "access");

    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new AppError("User Account not found", 401));
    }

    req.user = user;
    next();
});

exports.restrictTo =
    (...roles) =>
    (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    "You do not have permission to perform this action",
                    403
                )
            );
        }
        next();
    };

// TODO:
exports.forgotPassword = handleAsync(async (req, res, next) => {});
exports.resetPassword = handleAsync(async (req, res, next) => {});
exports.updatePassword = handleAsync(async (req, res, next) => {});
