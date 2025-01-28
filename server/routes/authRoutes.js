const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const path = require("path");
const upload = require('../helpers/multerHelper');

// Kullanıcı kaydı
router.post("/register", authController.register);

// Kullanıcı girişi
router.post("/login", authController.login);

// Kullanıcı çıkışı
router.get("/logout", authController.logout);

// Otomatik giriş (Token ile doğrulama) 
router.post("/auto-login", authMiddleware.protect, authController.autoLogin);

// Şifremi unuttum
router.post("/forgot-password", authController.forgotPassword);

//kullancı profil resmi
router.post("/change-user-photo", upload.single("photo"), authController.updateProfilePicture);
  
module.exports = router;
