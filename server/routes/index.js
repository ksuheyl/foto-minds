const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();


router.use("/auth",  require("./authRoutes"));

router.use("/userPictures", protect,  require("./userPictures"));


router.use("/pictures", require("./pictureRoutes"))

router.use("/backgrounds", require("./backgroundsRoutes"))


module.exports = router;
