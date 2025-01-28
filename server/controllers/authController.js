const bcrypt = require("bcrypt");
const db = require("../models");
const jwtHelper = require("../helpers/jwtHelper");
const path = require("path");
const fs = require("fs");

exports.register = async (req, res, next) => {
  let { password, email, } = req.body;
  try {
    const user = await db.users.create({
      email,
      password: password,
    });

    const token = jwtHelper.generateToken(user);
    res.status(200).json({
      success: true,
      message: "Registrations successful",
      isAuthenticated: true,
      token: token,
      ...user,
    });
  } catch (error) {
    console.log(error);
    
    res
      .status(500)
      .json({ success: false, message: "An Unexpected Error Occurred" });
    next();
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(205)
      .json({ success: false, message: "incorrect password or email" });
  }
  try {
    const user = await db.users
      .scope("withPassword")
      .findOne({ where: { email: email } });
    const isMatch = await bcrypt.compare(password, user ? user.password : "");
    if (!isMatch || !user)
      return res
        .status(205)
        .json({ success: false, message: "incorrect password or email" });
    const token = jwtHelper.generateToken(user);
    res.status(200).json({
      success: true,
      message: "Login successful",
      isAuthenticated: true,
      access_token: token,
      ...user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "An Unexpected Error Occurred" });
    next(error);
  }
};

exports.logout = async (req, res) => {
  res
    .status(200)
    .clearCookie("token")
    .json({ success: true, message: "Logged out successfully" });
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;
    //kullanıcıya mail gönderme
    if (!token) {
      const user = await db.users
        .scope("withPassword")
        .findOne({ where: { email } });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "There's no user with that email" });
      }
      //mail fonksiyonu
      const result = await forgotPasswordMail(email, user);

      if (!result) {
        return res.status(301).json({
          success: false,
          message: "An error occurred while send email",
        });
      }
      res
        .status(200)
        .json({ success: true, message: "Emails send successfully" });
    }
    //body'de token gelirse kullanıcı şifresini güncelle
    else {
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: "Password does not meet complexity requirements.",
        });
      }
      const user = await db.users.findOne({ where: { resetToken: token } });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Link Expired" });
      }
      const { resetTokenExpire } = user;
      if (resetTokenExpire > new Date()) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({
          password: hashedPassword,
          resetTokenExpire: null,
          resetToken: null,
        });
        return res
          .status(200)
          .json({ success: true, message: "Password updated successfully" });
      } else
        return res
          .status(404)
          .json({ success: false, message: "Link Expired" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "An Unexpected Error Occurred" });
    next();
  }
};

exports.autoLogin = async (req, res, next) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      isAuthenticated: true,
      message: "Auto login successful",
      user,
    });
  } catch (error) {
    console.log(error);
    
    res
      .status(500)
      .json({ success: false, message: "An Unexpected Error Occurred" });
    next();
  }
};

exports.updateProfilePicture = async (req, res, next) => {
  try {
    const userName = req.body.userName;
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded" });
    }
    const userInfo = await db.userInfo.findOne({ where: { userName } });
    if (!userInfo) {
      return res.status(404).send({ message: "User not found" });
    }
    if (userInfo.profilePicture) {
      const filePath = path.join(__dirname, "../", userInfo.profilePicture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log("File successfully deleted:", filePath);
          }
        });
      }
    }

    await userInfo.update({
      profilePicture: `/uploads/${req.file.webpFileName}`,
    });
    res.status(200).send({
      message: "Profile picture updated successfully",
      file: req.file,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "An Unexpected Error Occurred" });
    next();
  }
};
