const express = require('express');
const multer = require('multer');

const app = express();

// Multer configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'), // Folder for uploaded files
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`), // Filename
  }),
});

module.exports = upload;
