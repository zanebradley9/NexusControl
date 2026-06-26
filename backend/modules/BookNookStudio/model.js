const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true,
        trim: true
    },

    author: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        default: ""
    },

    genre: {
        type: String,
        default: "Unknown"
    },

    coverImage: {
        type: String,
        default: ""
    },

    pages: {
        type: Number,
        default: 0
    },

    publishedYear: Number,

    rating: {
        type: Number,
        default: 0
    },

    reviewCount: {
        type: Number,
        default: 0
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Book", BookSchema);