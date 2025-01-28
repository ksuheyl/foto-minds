const express = require("express");
const router = express.Router();
const { pictureUploader, getAllPictures } = require("../controllers/pictureController");
const upload = require("../helpers/multerHelper");

router.post("/", upload.single("photo"), pictureUploader);
router.get("/", getAllPictures);

module.exports = router;
