const express = require("express");
const User = require("../models/User");
const Doc = require("../models/Doc");
const multer = require("multer");
const fs = require("fs");

const router = express.Router();

router.get("/:userId", checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId });
    if (user == null) {
      return res.json({
        status: "fail",
        mssg: "No such user",
      });
    }

    let likedDocs = await Doc.find({ likedBy: user._id });
    likedDocs = likedDocs.map((doc) => {
      return {
        _id: doc._id,
        title: doc.title,
        data: doc.data,
        createdBy: doc.createdBy,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        isPublic: doc.isPublic,
        likedBy: doc.likedBy,
      };
    });

    res.json({
      status: "success",
      userProfile: {
        _id: user._id,
        name: user.name,
        userId: user.userId,
        profileImagePath: user.profileImagePath,
        likedDocs: likedDocs,
      },
    });
  } catch (e) {
    res.json({
      status: "error",
      err: e,
    });
  }
});

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".png") {
      return cb(res.status(400).end("only jpg, png is allowed"), false);
    }
    cb(null, true);
  },
});

const upload = multer({ storage: storage }).single("file");

router.patch("/:id/", checkAuthenticated, upload, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (req.user !== req.params.id) {
      return res.sendStatus(401);
    }
    if (req.body.name != null) user.name = req.body.name;
    if (req.body.userId != null) user.userId = req.body.userId;
    if (req.body.bookmark != null) {
      if (user.bookmarks.includes(req.body.bookmark)) {
        user.bookmarks = user.bookmarks.filter(
          (doc) => doc != req.body.bookmark
        );
      } else {
        user.bookmarks.push(req.body.bookmark);
      }
    }
    if (req.file != null) {
      if (user.profileImagePath !== "uploads/dummy-profile-pic.png")
        fs.unlinkSync(user.profileImagePath);
      user.profileImagePath = req.file.path;
    }
    await user.save();
    res.json({
      status: "success",
      name: user.name,
      userId: user.userId,
      bookmarks: user.bookmarks,
      profileImagePath: user.profileImagePath,
    });
  } catch (e) {
    res.json({
      status: "error",
      err: e,
    });
  }
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  else
    res.json({
      status: "fail",
      mssg: "Not authenticated",
    });
}

module.exports = router;
