
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

const nRegex = /^[ A-Za-z]*$/
const dateMatch = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/
exports.createBook = async function (req, res) {
    try {
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = req.body
        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "Title    cannot be empty" })
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
        if (userId.length !== 24) {
            return res.status(400).send({ status: false, msg: "Invalid userId" })
        }

        const userFound = await userModel.findOne({ _id: userId })
        if (!userFound) {
            return res.status(400).send({ status: false, msg: "User not found" })
        }

        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, msg: "ISBN cannot be empty" })
        }
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
        if (!isValid(releasedAt)) {
            return res.status(400).send({ status: false, msg: "releasedAt cannot be empty" })
        }
        if (!dateMatch.test(releasedAt)) {
            return res.status(400).send({ status: false, msg: "releasedAt is in invalid format" })
        }
        let bookCreated = await booksModel.create({ title, excerpt, userId, ISBN, category, subcategory, releasedAt })
        let noDate = moment().format(releasedAt, "YYYYMMDD")
        bookCreated = bookCreated.toObject()
        bookCreated.releasedAt = noDate
        res.status(201).send({ status: true, msg: bookCreated })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })

    }

}

//___________Get /books______________
//By userId By category By subcategory
// const getBooks = async function (req, res) {
//     try {

//         let { userId, category, subcategory } = req.query
//         let obj = {
//             isDeleted: false
//         }

//         if (userId) {
//             if (userId.trim().length == 0) return res.status(400).send({ status: false, msg: "Dont Left userId Query Empty" })
//             if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "The Format of userId is invalid" })
//             let data = await userModel.findById({ _id: userId })
//             if (!data) return res.status(400).send({ status: false, msg: "The userId is invalid" })
//             obj.userId = userId
//         }

//         if (category) {
//             if (category.trim().length == 0) return res.status(400).send({ status: false, msg: "Dont Left Category Query Empty" })
//             obj.category = category.trim
//             category = category.split(" ").join("")
//         }


//         if (subcategory) {
//             if (subcategory.trim().length == 0) return res.status(400).send({ status: false, msg: "Dont Left subcategory Query Empty" })
//             obj.subcategory = subcategory.trim()
//         }

//         let data = await booksModel.find(obj)
//         if (data.length == 0) {
//             return res.status(404).send({ status: false, msg: "No book Found with provided information...Pls Check The Upper And Lower Cases Of letter" })
//         }
//         else {
//             return res.status(200).send({ status: true, msg: data })
//         }
//     }
//     catch (err) {
//         console.log(err)
//         res.status(500).send({ status: false, msg: err.message })
//     }
// }

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
            if (!data) return res.status(400).send({ status: false, msg: "The bookId is invalid" })
            obj.bookId = bookId
        }

        let data = await booksModel.findOne(obj)
        let reFound = await reviewModel.find({ bookId }).select({ _id: 1, bookId: 1, reviewedBy: 1, createdAt: 1, rating: 1, review: 1 })

        data = data.toObject()
        reFound = reFound[0].toObject()
        reviewedAt = reFound.createdAt
        delete reFound.createdAt
        reFound.reviewedAt = reviewedAt
        data.reviewsData = reFound
        // console.log(data)

        if (data.length == 0) {
            return res.status(400).send({ status: false, msg: "No book Found with provided information...Pls Check The Upper And Lower Cases Of letter" })
        }
        else {
            return res.status(200).send({ status: true, msg: data })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
}
const updateBook = async function (req, res) {
    try {
        const bookId = req.params.bookId;
        const data = req.body;
        const { title, excerpt, releaseDate, ISBN } = data;

        if (title) {

            const checKTitle = await booksModel.findOne({
                title: title,
                isDeleted: false,
            })

            if (checKTitle) {
                return res.status(404).send({ status: false, message: "Book with these title is already present" });

            }
            if (ISBN) {
                const CheckISBn = await booksModel.findOne({
                    ISBN: ISBN,
                    isDeleted: false,
                });
                if (CheckISBn)
                    return res.status(400).send({ status: false, message: "Book with this isbn is already exist" })
            }

        }
        const bookData = await booksModel.findOneAndUpdate(
            { _id: bookId, isDeleted: false },
            { title: title, excerpt: excerpt, releaseAt: releaseDate, ISBN: ISBN },
            { new: true }




        );

        res.status(200).send({ status: true, message: "Succes", data: bookData })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}


//____Delete books By Id__________
const deleteBook = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        let find = await booksModel.findById(bookId)
        if (!find) return res.status(400).send({ status: false, msg: "The Id You Have Entered Is doesnot exists" })
        if (find.isDeleted == true) return res.status(400).send({ status: false, msg: "The Id You have entered is already deleted" })
        let date = new Date().toISOString()
        console.log(find)
        await booksModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: date } })
        return res.status(200).send({ status: true, data: "The data Is now deleted" });

    }
    catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
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

        }


        if (subcategory) {
            if (subcategory.trim().length == 0) return res.status(400).send({ status: false, msg: "Dont Left subcategory Query Empty" })
            obj.subcategory = subcategory.trim()
        }
        console.log(obj)
        let data = await booksModel.find(obj)
        console.log(obj)
        if (data.length == 0) {
            return res.status(404).send({ status: false, msg: "No book Found with provided information...Pls Check The Upper And Lower Cases Of letter" })
        }
        else {
            return res.status(200).send({ status: true, msg: data })
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.deleteBook = deleteBook
module.exports.updateBook = updateBook;
module.exports.getBooksById = getBooksById
module.exports.getBooks = getBooks