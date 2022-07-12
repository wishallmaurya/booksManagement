
const booksModel = require('../model/booksModel')
const moment = require('moment')
const mongoose = require('mongoose')
const userModel = require('../model/userModel')
const reviewModel = require('../model/reviewModel')

const isValid = (str) => {
    if (str === undefined || str == null) return false;
    if (typeof str == "string" && str.trim().length == 0) return false;
    return true;
}
const rexIsbn = /^[1-9][0-9]{9,14}$/
const nRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/
const dateMatch = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/
exports.createBook = async function (req, res) {
    try {

        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = req.body

        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "Title cannot be empty" })
        }
        const foundTitle = await booksModel.findOne({ title })
        if (foundTitle) {
            return res.status(400).send({ status: false, msg: "This title is alreay being used" })
        }
        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, msg: "excerpt cannot be empty" })
        }
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, msg: "userId cannot be empty" })
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "Invalid userId" })
        }

        const userFound = await userModel.findOne({ _id: userId })
        if (!userFound) {
            return res.status(400).send({ status: false, msg: "User not found" })
        }

        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, msg: "ISBN cannot be empty" })
        }
        if (!rexIsbn.test(ISBN)) return res.status(400).send({ status: false, msg: "ISBN is invalid use 10 to 15 digit ISBN" })
        const foundISBN = await booksModel.findOne({ ISBN })
        if (foundISBN) {
            return res.status(400).send({ status: false, msg: "This ISBN is already being used" })
        }

        if (!isValid(category)) {
            return res.status(400).send({ status: false, msg: "category cannot be empty" })
        }
        if (!nRegex.test(category)) {
            return res.status(400).send({ status: false, msg: "catgory contains invalid character" })
        }
        if (!isValid(subcategory)) {
            return res.status(400).send({ status: false, msg: "subcategory cannot be empty" })
        }
        if (!nRegex.test(subcategory)) {
            return res.status(400).send({ status: false, msg: "subcatgory contains invalid character" })
        }
        subcategory = subcategory.map(element => {
            return element.toLowerCase();
        });

        if (!isValid(releasedAt)) {
            return res.status(400).send({ status: false, msg: "releasedAt cannot be empty" })
        }
        if (!dateMatch.test(releasedAt)) {
            return res.status(400).send({ status: false, msg: "releasedAt is in invalid format" })
        }
        let bookCreated = await booksModel.create({ title, excerpt, userId, ISBN, category, subcategory, releasedAt })
        if (moment(releasedAt) > moment()) return res.status(400).send({ status: false, msg: "releasedAt cannot be in future" })
        let noDate = moment().format(releasedAt, "YYYYMMDD")
        bookCreated = bookCreated.toObject()
        bookCreated.releasedAt = noDate
        res.status(201).send({ status: true, message: 'Success', data: bookCreated })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })

    }

}


//By userId By category By subcategory
const getBooks = async function (req, res) {
    try {

        let { userId, category, subcategory } = req.query
        let obj = {
            isDeleted: false
        }


        if (userId) {
            if (userId.trim().length == 0) return res.status(400).send({ status: false, msg: "Dont Left userId Query Empty" })
            if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "The Format of userId is invalid" })
            let data = await userModel.findById({ _id: userId })
            if (!data) return res.status(400).send({ status: false, msg: "The userId is invalid" })
            obj.userId = userId
        }

        if (category) {
            if (category.trim().length == 0) return res.status(400).send({ status: false, msg: "Dont Left Category Query Empty" })
            obj.category = category
            category = category.toLowerCase()



        }

        if (subcategory) {
            if (subcategory.trim().length == 0) return res.status(400).send({ status: false, msg: "Dont Left subcategory Query Empty" })
            obj.subcategory = subcategory
            subcategory = subcategory.toLowerCase()
            console.log(subcategory)

        }

        let data = await booksModel.find(obj).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 }).sort({ title: 'asc' })
        if (data.length == 0) {
            return res.status(404).send({ status: false, msg: "No book Found with provided information...Pls Use Valid Filters " })
        }
        else {
            return res.status(200).send({ status: true, message: 'Books list', data: data })
        }
    }
    catch (err) {

        res.status(500).send({ status: false, msg: err.message })
    }
}



//Get books By id
const getBooksById = async function (req, res) {
    try {

        let { bookId } = req.params


        let obj = {
            isDeleted: false
        }
        if (bookId) {
            if (bookId.trim().length == 0) return res.status(400).send({ status: false, msg: "Dont Left bookId Query Empty" })
            if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: "The Format of bookId is invalid" })
            let data = await booksModel.findById({ _id: bookId })
            if (!data) return res.status(404).send({ status: false, msg: "The bookId is not found" })
            obj._id = bookId
        }
        let data = await booksModel.findOne(obj)
        let reFound = await reviewModel.find({ bookId }).select({ _id: 1, bookId: 1, reviewedBy: 1, reviewAt: 1, review: 1, rating: 1 })
        if (data == null) {
            return res.status(404).send({ status: false, msg: "No book Found with provided information...Use Valid credentials " })
        }
        else {

            data = data.toObject()
            delete data.__v
            data.reviewsData = reFound

            return res.status(200).send({ status: true, message: 'Books list', data: data })
        }
    }
    catch (err) {

        res.status(500).send({ status: false, msg: err.message })
    }
}

const updateBook = async function (req, res) {
    try {
        const bookId = req.params.bookId;
        const data = req.body;
        const { title, excerpt, releaseDate, ISBN } = data;
        if (bookId) {
            if (bookId.trim().length == 0) return res.status(400).send({ status: false, msg: "Dont Left bookId Query Empty" })
            if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: "The Format of bookId is invalid" })
            let data = await booksModel.findById(bookId) 
            if (!data) return res.status(404).send({ status: false, msg: "The bookId is not found" })
         
        }
        let del = await booksModel.findById(bookId)
        if (del.isDeleted == true) {
            return res.status(400).send({ status: false, msg: "The BookId you are updating is Already deleted" })
        }
    
        if (!data) return res.status(400).send({ status: false, msg: "The bookId is invalid" })

        if (!dateMatch.test(releaseDate)) {
            return res.status(400).send({ status: false, msg: "releaseDate is in invalid format" })
        }
        if (moment(releaseDate) > moment()) return res.status(400).send({ status: false, msg: "releaseDate cannot be in future" })

        if (title) {
            const checKTitle = await booksModel.findOne({
                title: title,
            })
            if (checKTitle) {
                return res.status(400).send({ status: false, message: "Book with these title is already present" })
            }
        }
        if (ISBN) {
            const CheckISBn = await booksModel.findOne({
                ISBN: ISBN,
            });
            if (CheckISBn)
                return res.status(400).send({ status: false, message: "Book with this ISBN is already exist" })
        }
        const bookData = await booksModel.findOneAndUpdate(
            { _id: bookId },
            { title: title, excerpt: excerpt, releaseAt: releaseDate, ISBN: ISBN },
            { new: true }
        );

        res.status(200).send({ status: true, message: "Success", data: bookData })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}
//date needs to be corrected

//____Delete books By Id__________
const deleteBook = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        if (bookId) {
            if (bookId.trim().length == 0) return res.status(400).send({ status: false, msg: "Dont Left bookId Query Empty" })
            if (!mongoose.isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: "The Format of bookId is invalid" })
            let data = await booksModel.findById(bookId) 
            if (!data) return res.status(404).send({ status: false, msg: "The bookId is not found" })
         
        }
    
        
        let find = await booksModel.findById(bookId)
        if (!find) return res.status(404).send({ status: false, msg: "The Id You Have Entered Is doesnot exists" })
        if (find.isDeleted == true) return res.status(400).send({ status: false, msg: "The Book is already deleted" })
        let date = new Date().toISOString()
        await booksModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: date } })
        return res.status(200).send({ status: true, message: 'Success', data: "The book is deleted" });

    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }
}



module.exports.deleteBook = deleteBook
module.exports.updateBook = updateBook;
module.exports.getBooksById = getBooksById
module.exports.getBooks = getBooks