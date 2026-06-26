const mongoose = require("mongoose");

const ResetPasswordSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    token: {
        type: String,
        required: true
    },

    resetAt: {
        type: Date,
        default: Date.now
    },

    ipAddress: {
        type: String,
        default: ""
    },

    userAgent: {
        type: String,
        default: ""
    }
},
{
    timestamps: true
});

module.exports = mongoose.model(
    "ResetPassword",
    ResetPasswordSchema
);