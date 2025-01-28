const db = require("../models")

const backgroundsUploader = async (req, res, nex) => { 
  if (!req.file) {  
    return res.status(400).send("No file uploaded.");
  }
  try {
    const newPicture = await db.backgrounds.create({
      url: `/uploads/${req.file.filename}`,
      backgroundName:req.body.backgroundName 
    });

    res.status(201).json(newPicture);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "fotoğraf yüklenemedi", error });
  }
};
const getAllBackgrounds = async (req, res, next) => {
  try {
    const backgrounds = await db.backgrounds.findAll();
    res.status(200).json(backgrounds);
  } catch (error) {
    res
    .status(500)
    .json({ success: false, message: "An Unexpected Error Occurred" });
    next();
  }
};
module.exports = {backgroundsUploader,getAllBackgrounds}