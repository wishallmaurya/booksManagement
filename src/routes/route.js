const express = require("express");
const router = express.Router();

router.post("/register",);

router.post("/login",);

router.post("/books",);

router.get("/books",);

router.get("/books/:bookId",);

router.put("/books/:bookId",);

router.delete("/books/:bookId",);

router.post("/books/:bookId/review",);

router.put("/books/:bookId/review/:reviewId",);

router.delete("/books/:bookId/review/:reviewId",);



module.exports = router;
