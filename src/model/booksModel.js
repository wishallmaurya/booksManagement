const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const booksSchema = new mongoose.Schema
    ({
        title: { type: String, required: true,unique: true, trim: true },
        excerpt: { type: String, required: true, trim: true },
        userId: { type: ObjectId, required: true, ref: "user", trim: true },
        ISBN: { type: String, required: true, unique: true, trim: true },
        category: { type: String, required: true, trim: true },
        subcategory: { type: String, required: true, trim: true },
        reviews: {type:Number, required: true,default: false},
        deletedAt: Date,
        isDeleted: { type: Boolean, default: false },
        releasedAt: Date,
        isreleasedAt: { type: Boolean, required: true, default: false },
        
    } ,{timestamps:true});

module.exports = mongoose.model("booksModel", booksSchema);

