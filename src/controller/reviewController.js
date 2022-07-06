const booksModel = require('../model/booksModel')
const moment = require('moment')
const reviewModel = require('../model/reviewModel')

const isValid = (str) => {
    if (str === undefined || str == null) return false;
    if (typeof str == "string" && str.trim().length == 0) return false;
    return true;
}
const nRegex = /^[ A-Za-z]*$/
exports.createReview = async function (req, res) {
    const book = req.params.bookId
    if (!book) return res.status(400).send({ status: false, msg: "Book id musst be presennt" })
    if (book.length != 24) return res.status(400).send({ status: false, msg: "Book id is incorret" })
    const bookExist = await booksModel.findOne({ _id: book, isDeleted: false })
    if (bookExist == null || bookExist == undefined) return res.status(404).send({ status: false, msg: "Book not found" })
    const { review, rating, reviewerName } = req.body
    if (!isValid(review)) return res.status(400).send({ status: false, msg: "Review cannot be empty" })
    if (!isValid(rating)) return res.status(400).send({ status: false, msg: "rating cannot be empty" })
    if (rating > 5 || rating < 1) return res.status(400).send({ status: false, msg: "rating mustbe 1 to 5" })
    if (!isValid(reviewerName)) return res.status(400).send({ status: false, msg: "reviewerName cannot be empty" })
    if (!nRegex.test(reviewerName)) return res.status(400).send({ status: false, msg: "reviewerName is invalid" })
    const formatedDate = moment(Date.now()).toISOString()
    const revieCreated = await reviewModel.create({ reviewedBy: reviewerName, rating, review, reviewAt: formatedDate, bookId: book })
    await booksModel.findByIdAndUpdate(book, { $inc: { reviews: 1 } })
    res.status(201).send({ status: true, msg: revieCreated })
}