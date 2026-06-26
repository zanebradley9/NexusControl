const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        default: ""
    },

    developer: {
        type: String,
        default: ""
    },

    publisher: {
        type: String,
        default: ""
    },

    genre: {
        type: String,
        default: ""
    },

    platform: {
        type: String,
        default: "PC"
    },

    releaseDate: Date,

    image: {
        type: String,
        default: ""
    },

    price: {
        type: Number,
        default: 0
    },

    salePrice: {
        type: Number,
        default: 0
    },

    rating: {
        type: Number,
        default: 0
    },

    downloads: {
        type: Number,
        default: 0
    },

    featured: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Game", GameSchema);