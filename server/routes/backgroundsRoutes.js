const express = require("express");
const router = express.Router();

const upload = require("../helpers/multerHelper");
const { backgroundsUploader, getAllBackgrounds } = require("../controllers/backgroundsController");

router.post("/", upload.single("photo"), backgroundsUploader);
router.get("/", getAllBackgrounds);

module.exports = router;
