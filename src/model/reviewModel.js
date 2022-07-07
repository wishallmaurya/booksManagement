const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = new mongoose.Schema(
    {
        bookId: {
            type: ObjectId,
            required: true,
            ref: "Book",
        },

        reviewedBy: {
            type: String,
            required: true,
            default: 0
        },

        reviewAt: {
            type: String,
            required: true,
        },

        review: {
            type: String,
        },
        rating: {
            type: Number,
            required: true
        },

        isDeleted: {
            type: Boolean,
            default: false
        }

    }, { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema)
