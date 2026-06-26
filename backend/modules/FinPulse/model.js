const mongoose = require("mongoose");

const StockSchema = new mongoose.Schema(
{
    symbol: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },

    company: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        default: 0
    },

    change: {
        type: Number,
        default: 0
    },

    changePercent: {
        type: Number,
        default: 0
    },

    volume: {
        type: Number,
        default: 0
    },

    marketCap: {
        type: Number,
        default: 0
    },

    sector: {
        type: String,
        default: ""
    },

    lastUpdated: {
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Stock", StockSchema);