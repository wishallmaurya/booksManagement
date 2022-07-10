const booksModel = require('../model/booksModel')
const moment = require('moment')
const reviewModel = require('../model/reviewModel')
const mongoose = require('mongoose');

const isValid = (str) => {
    if (str === undefined || str == null) return false;
    if (typeof str == "string" && str.trim().length == 0) return false;
    return true;
}
const nRegex = /^[ A-Za-z]*$/
const rexrating = /^[1-5]$/

exports.validationForReview = (req, res) => {
    const { review, rating, reviewedBy } = req.body
    if (!isValid(review)) return res.status(400).send({ status: false, msg: "Review cannot be empty" })
    if (!isValid(rating)) return res.status(400).send({ status: false, msg: "rating cannot be empty" })
    if (!rexrating.test(rating)) return res.status(400).send({ status: false, msg: "rating mustbe 1 to 5" })
    if (!isValid(reviewedBy)) return res.status(400).send({ status: false, msg: "reviewedBy cannot be empty" })
    if (!nRegex.test(reviewedBy)) return res.status(400).send({ status: false, msg: "reviewedBy is invalid" })
}

const validationsReviewEdirAndDelete = async (req, res) => {
    const currentId = req.params.reviewId
    const bookId = req.params.bookId
    if (currentId.length !== 24) { return res.status(400).send({ status: false, msg: "Invalid review Id" }) }
    if (bookId.length !== 24) return res.status(400).send({ status: false, msg: "Invalid book Id" })
    const bookIdFound = await booksModel.findOne({ isDeleted: false, _id: bookId })
    if (!bookIdFound) { return res.status(404).send({ status: false, msg: "Book not found" }) }
    const userIdFound = await reviewModel.findOne({ isDeleted: false, _id: currentId })
    if (!userIdFound) { return res.status(404).send({ status: false, msg: "review not found" }) }

}


exports.createReview = async function (req, res) {
    const book = req.params.bookId
    const curBook = mongoose.Types.ObjectId.isValid(book)
    if (!curBook) return res.status(400).send({ status: false, msg: "book is invalid" })
    if (!book) return res.status(400).send({ status: false, msg: "Book id musst be presennt" })
    if (book.length != 24) return res.status(400).send({ status: false, msg: "Book id is invalid" })
    const bookExist = await booksModel.findOne({ _id: book, isDeleted: false })
    if (bookExist == null || bookExist == undefined) return res.status(404).send({ status: false, msg: "Book not found" })
    const { review, rating, reviewedBy } = req.body
    if (!isValid(review)) return res.status(400).send({ status: false, msg: "Review cannot be empty" })
    if (!isValid(rating)) return res.status(400).send({ status: false, msg: "rating cannot be empty" })
    if (!rexrating.test(rating)) return res.status(400).send({ status: false, msg: "rating mustbe 1 to 5" })
    if (!isValid(reviewedBy)) return res.status(400).send({ status: false, msg: "reviewedBy cannot be empty" })
    if (!nRegex.test(reviewedBy)) return res.status(400).send({ status: false, msg: "reviewedBy is invalid" })
    const formatedDate = moment(Date.now()).toISOString()
    const revieCreated = await reviewModel.create({ reviewedBy: reviewedBy, rating, review, reviewAt: formatedDate, bookId: book })
    await booksModel.findByIdAndUpdate(book, { $inc: { reviews: 1 } })
    res.status(201).send({ status: true, msg: revieCreated })
}

exports.editReview = async function (req, res) {
    try {
        const currentId = req.params.reviewId
        const bookId = req.params.bookId
        const curVal = mongoose.Types.ObjectId.isValid(currentId)
        const curBook = mongoose.Types.ObjectId.isValid(bookId)
        if (!curVal) return res.status(404).send({ status: false, msg: "review not found" })
        if (!curBook) return res.status(404).send({ status: false, msg: "Book not found" })
        const bookIdFound = await booksModel.findOne({ isDeleted: false, _id: bookId }).select({ _id: 1 })
        if (!bookIdFound) { return res.status(404).send({ status: false, msg: "Book not found" }) }
        const userIdFound = await reviewModel.findOne({ isDeleted: false, _id: currentId }).select({ _id: 1 })
        if (!userIdFound) { return res.status(404).send({ status: false, msg: "review not found" }) }
        if (bookIdFound._id.toString() != userIdFound._id.toString()) {
            return res.status(404).send({ status: false, msg: "review not found" })
        }
        const { review, rating, reviewedBy } = req.body
        const reviewEdited = await reviewModel.findOneAndUpdate({ _id: currentId }, { $set: { reviewedBy: reviewedBy, review, rating } }, { new: true })
        res.status(200).send({ status: true, msg: reviewEdited })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }

}

exports.deleteReview = async function (req, res) {
    try {
        const currentId = req.params.reviewId
        const bookId = req.params.bookId
        const curVal = mongoose.Types.ObjectId.isValid(currentId)
        const curBook = mongoose.Types.ObjectId.isValid(bookId)
        if (!curVal) return res.status(404).send({ status: false, msg: "review Id is incorrect" })
        if (!curBook) return res.status(404).send({ status: false, msg: "book Id is incorrect" })
        if (currentId.length !== 24) { return res.status(400).send({ status: false, msg: "Invalid review Id" }) }
        if (bookId.length !== 24) return res.status(400).send({ status: false, msg: "Invalid book Id" })
        const bookIdFound = await booksModel.findOne({ isDeleted: false, _id: bookId })
        if (!bookIdFound) { return res.status(404).send({ status: false, msg: "Book not found" }) }
        const userIdFounds = await reviewModel.findOne({ isDeleted: false, _id: currentId })
        if (!userIdFounds) { return res.status(404).send({ status: false, msg: "review not found" }) }
        await reviewModel.findOneAndUpdate({ _id: currentId }, { $set: { isDeleted: true } })
        await booksModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } })
        res.status(200).send({ status: true, msg: "deledted" })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }

}