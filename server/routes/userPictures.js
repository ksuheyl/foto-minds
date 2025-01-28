const express = require("express");
const router = express.Router();
const { addUserPicture, getAllUserPictures } = require("../controllers/userPicturesController");

router.post("/", addUserPicture);

router.get("/", getAllUserPictures);

module.exports = router;