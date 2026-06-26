const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },

    message: {
        type: String,
        default: ""
    },

    severity: {
        type: String,
        enum: [
            "Low",
            "Medium",
            "High",
            "Critical"
        ],
        default: "Low"
    },

    source: {
        type: String,
        default: "System"
    },

    resolved: {
        type: Boolean,
        default: false
    },

    metadata: {
        type: Object,
        default: {}
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("SentinelAlert", AlertSchema);