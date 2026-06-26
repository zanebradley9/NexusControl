const mongoose = require("mongoose");

const ForgotPasswordSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    token: {
        type: String,
        required: true
    },

    expiresAt: {
        type: Date,
        required: true
    },

    used: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
});

module.exports = mongoose.model(
    "ForgotPassword",
    ForgotPasswordSchema
);