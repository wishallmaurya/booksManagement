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

exports.validationsReviewEdirAndDelete = async (req, res, next) => {
    const currentId = req.params.reviewId
    const bookId = req.params.bookId
    const curVal = mongoose.Types.ObjectId.isValid(currentId)
    const curBook = mongoose.Types.ObjectId.isValid(bookId)
    if (!curVal) return res.status(400).send({ status: false, msg: "review id is invalid" })
    if (!curBook) return res.status(400).send({ status: false, msg: "Book id is invalid" })
    const bookIdFound = await booksModel.findOne({ isDeleted: false, _id: bookId }).select({ _id: 1 })
    if (!bookIdFound) { return res.status(404).send({ status: false, msg: "Book not found" }) }
    const userIdFound = await reviewModel.findOne({ isDeleted: false, _id: currentId }).select({ bookId: 1 })
    if (!userIdFound) { return res.status(404).send({ status: false, msg: "review not found" }) }
    if (bookIdFound._id.toString() != userIdFound.bookId.toString()) {
        return res.status(404).send({ status: false, msg: "review not found" })
    }
    next()

}

const savedData = (str) => {
    let showResult = {}
    showResult._id = str._id
    showResult.bookId = str.bookId
    showResult.reviewedBy = str.reviewedBy
    showResult.reviewedAt = str.reviewAt
    showResult.rating = str.rating
    if (str.review) { showResult.review = str.review }
    return showResult
}


exports.createReview = async function (req, res) {
    const book = req.params.bookId
    const curBook = mongoose.Types.ObjectId.isValid(book)
    if (!curBook) return res.status(400).send({ status: false, msg: "book is invalid" })
    if (!book) return res.status(400).send({ status: false, msg: "Book id must be present" })
    const bookExist = await booksModel.findOne({ _id: book, isDeleted: false })
    if (bookExist == null || bookExist == undefined) return res.status(404).send({ status: false, msg: "Book not found" })
    let { review, rating, reviewedBy } = req.body
    console.log(reviewedBy.trim() == 0)
    if (!isValid(rating)) return res.status(400).send({ status: false, msg: "rating cannot be empty" })
    if (!rexrating.test(rating)) return res.status(400).send({ status: false, msg: "rating mustbe 1 to 5" })
    if (reviewedBy.trim() == 0) {
        reviewedBy = 'Guest'
        console.log(reviewedBy)
    }
    if (!nRegex.test(reviewedBy)) return res.status(400).send({ status: false, msg: "reviewedBy is invalid" })
    const formatedDate = moment(Date.now()).toISOString()
    let revieCreated = await reviewModel.create({ reviewedBy: reviewedBy, rating, review, reviewedAt: formatedDate, bookId: book })
    revieCreated = revieCreated.toObject()
    let showResult = savedData(revieCreated)
    let fBook = await booksModel.findByIdAndUpdate(book, { $inc: { reviews: 1 } })
    fBook = fBook.toObject()
    fBook.reviewsData = showResult
    res.status(201).send({ status: true, msg: "Success", data: fBook })
}

exports.editReview = async function (req, res) {
    try {
        const currentId = req.params.reviewId
        const bookId = req.params.bookId
        const { review, rating, reviewedBy } = req.body
        let reviewEdited = await reviewModel.findOneAndUpdate({ _id: currentId }, { $set: { reviewedBy, review, rating } }, { new: true })
        let bookFound = await booksModel.findOne({ _id: bookId })
        let showResult = savedData(reviewEdited)
        bookFound = bookFound.toObject()
        bookFound.reviewsData = showResult
        res.status(200).send({ status: true, msg: "Success", data: bookFound })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }

}

exports.deleteReview = async function (req, res) {
    try {
        const currentId = req.params.reviewId
        const bookId = req.params.bookId
        await reviewModel.findOneAndUpdate({ _id: currentId }, { $set: { isDeleted: true } })
        await booksModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } })
        res.status(200).send({ status: true, msg: "Success", data: "The Review is Deleted" })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }

}