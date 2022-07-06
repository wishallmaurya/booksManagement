
const booksModel = require('../model/booksModel')
const moment = require('moment')

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

        // const userFound = await usersModel.findOne({ _id: userId })
        // if (!userFound) {
        //     return res.status(400).send({ status: false, msg: "User not found" })
        // }

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