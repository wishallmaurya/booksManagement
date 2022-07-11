const express = require("express");
const router = express.Router();

const userController = require("../controller/userController")
const booksController = require("../controller/booksController");
const reviewController = require("../controller/reviewController");
const middleware = require('../middleware/auth')

router.post("/register", userController.createUser);

router.post("/login", userController.userLogin);

router.post("/books", middleware.authentication, middleware.auth2, booksController.createBook);

//can take future date as released date
//isbn taking alphabet 
//

router.get("/books", middleware.authentication, booksController.getBooks);
//not in alphabetical order

router.get("/books/:bookId", middleware.authentication, booksController.getBooksById);

//only getting book of "Spider Man 5" ==corrected



router.put("/books/:bookId", middleware.authentication, middleware.authForDelAndUp, booksController.updateBook);



router.delete("/books/:bookId", middleware.authentication, middleware.authForDelAndUp, booksController.deleteBook);

router.post("/books/:bookId/review", reviewController.createReview);

router.put("/books/:bookId/review/:reviewId", reviewController.editReview);

router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview);



module.exports = router;
