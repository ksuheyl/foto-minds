const db = require("../models");

const addUserPicture = async (req, res, nex) => {
  try {
    const { url,  } = req.body;
    const userId = req.user.id 
    const newPicture = await db.userPictures.create({
      url: url,
      userId: userId,
    });

    res.status(201).json(newPicture);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "fotoğraf yüklenemedi", error });
  }
};
const getAllUserPictures = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const pictures = await db.userPictures.findAll({ where: { userId } });
    res.status(200).json(pictures);
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ success: false, message: "An Unexpected Error Occurred" });
    next();
  }
};
module.exports = { addUserPicture, getAllUserPictures };
