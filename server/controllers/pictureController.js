const axios = require("axios");
const db = require("../models")

const pictureUploader = async (req, res, nex) => { 
  if (!req.file) {  
    return res.status(400).send("No file uploaded.");
  }
  try {
    const newPicture = await db.pictures.create({
      url: `/uploads/${req.file.filename}`, 
    });

    res.status(201).json(newPicture);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "fotoğraf yüklenemedi", error });
  }
};
const getAllPictures = async (req, res, next) => {
  try {
    const pictures = await db.pictures.findAll();
    res.status(200).json(pictures);
  } catch (error) {
    res
    .status(500)
    .json({ success: false, message: "An Unexpected Error Occurred" });
    next();
  }
};
module.exports = {pictureUploader,getAllPictures}