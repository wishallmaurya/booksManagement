const express = require("express");
const router = express.Router();

const userController = require("../controller/userController")
const booksController = require("../controller/booksController");
const reviewController = require("../controller/reviewController");


router.post("/register", userController.createUser);

router.post("/login", userController.userLogin);

router.post("/books", booksController.createBook);

router.get("/books", booksController.getBooks);

router.get("/books/:bookId", booksController.getBooksById);

router.put("/books/:bookId", booksController.updateBook);

router.delete("/books/:bookId", booksController.deleteBook);

router.post("/books/:bookId/review", reviewController.createReview);

router.put("/books/:bookId/review/:reviewId", reviewController.editReview);

router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview);



module.exports = router;
