const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            validate: [validator.isEmail, "Please provide a valid email"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters long"],
            select: false,
        },
        passwordConfirm: {
            type: String,
            required: [true, "Please confirm your password"],
            validate: {
                validator: function (el) {
                    return el === this.password;
                },
                message: "Passwords do not match",
            },
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
    },
    {
        timestamps: true,
    }
);

// MIDDLEWARES
userSchema.pre("save", function (next) {
    this.password = bcrypt.hashSync(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

// INSTANCE METHODS
userSchema.methods.checkPassword = function (candidatePassword, userPassword) {
    return bcrypt.compareSync(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
