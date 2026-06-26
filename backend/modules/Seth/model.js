const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    prompt: {
        type: String,
        required: true
    },

    response: {
        type: String,
        default: ""
    },

    model: {
        type: String,
        default: "seth-v1"
    },

    tokens: {
        type: Number,
        default: 0
    }
},
{
    timestamps: true
});

module.exports = mongoose.model(
    "SethConversation",
    ConversationSchema
);