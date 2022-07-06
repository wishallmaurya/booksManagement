const express = require("express");
const router = express.Router();

const userController = require("../controller/userController")
const booksController = require("../controller/booksController")

router.post("/register", userController.createUser);

router.post("/login", userController.userLogin);

router.post("/books", booksController.createBook);

// router.get("/books",);

// router.get("/books/:bookId",);

// router.put("/books/:bookId",);

// router.delete("/books/:bookId",);

// router.post("/books/:bookId/review",);

// router.put("/books/:bookId/review/:reviewId",);

// router.delete("/books/:bookId/review/:reviewId",);



module.exports = router;
