const express = require("express");
const fs = require("fs");
const multer = require("multer");
const Doc = require("../models/Doc");
const User = require("../models/User");
const ObjectId = require("mongoose").Types.ObjectId;
const router = express.Router();

router.get("/", checkAuthenticated, async (req, res) => {
  const id = req.user;
  try {
    let docList = await Doc.find({ createdBy: ObjectId(id) });
    docList = docList.map((doc) => {
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
    return res.json({
      status: "success",
      data: docList,
    });
  } catch (e) {
    return res.json({
      status: "error",
      err: e,
    });
  }
});

router.get("/search", checkAuthenticated, async (req, res) => {
  const title = req.query.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const userId = req.query.userId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  try {
    const idList = await User.find(
      { userId: { $regex: userId, $options: "i" } },
      { _id: 1 }
    );
    let docList;
    docList = await Doc.find({
      title: { $regex: title, $options: "i" },
      createdBy: { $in: idList },
      isPublic: true,
    });

    docList = docList.map((doc) => {
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
    return res.json({
      status: "success",
      docList: docList,
    });
  } catch (e) {
    return res.json({
      status: "error",
      err: e,
    });
  }
});

router.post("/", checkAuthenticated, async (req, res) => {
  const id = req.user;
  const newDoc = new Doc({
    title: req.body.title,
    createdBy: ObjectId(id),
  });
  try {
    newDoc.sharedTo.push(ObjectId(id));
    await newDoc.save();
    return res.json({
      status: "success",
      data: newDoc,
    });
  } catch (e) {
    return res.json({
      status: "error",
      err: e,
    });
  }
});

router.get("/:id/view", checkAuthenticated, async (req, res) => {
  const userId = req.user;
  const docId = req.params.id;
  try {
    const doc = await Doc.findById(docId)
      .populate("createdBy", "userId profileImagePath")
      .exec();
    if (doc == null) {
      return res.json({
        status: "fail",
        mssg: "no doc with this id",
      });
    } else if (!doc.isPublic && doc.createdBy._id != userId) {
      return res.json({
        status: "fail",
        mssg: "not allowed",
      });
    }
    const data = {
      _id: doc._id,
      title: doc.title,
      data: doc.data,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isPublic: doc.isPublic,
      likedBy: doc.likedBy,
      comments: doc.comments,
    };
    return res.json({
      status: "success",
      doc: data,
    });
  } catch (e) {
    return res.json({
      status: "error",
      err: e,
    });
  }
});

router.get("/:id/edit", checkAuthenticated, async (req, res) => {
  const userId = req.user;
  const docId = req.params.id;
  try {
    const doc = await Doc.findById(docId).populate("sharedTo", "userId").exec();
    if (doc == null) {
      return res.json({
        status: "fail",
        mssg: "no doc with this id",
      });
    } else if (!doc.sharedTo.some((d) => d._id == userId)) {
      return res.json({
        status: "fail",
        mssg: "not allowed",
      });
    }
    const data = {
      _id: doc._id,
      title: doc.title,
      data: doc.data,
      isPublic: doc.isPublic,
      sharedList: doc.sharedTo.map((user) => user.userId),
      createdBy: doc.createdBy,
    };
    return res.json({
      status: "success",
      doc: data,
    });
  } catch (e) {
    return res.json({
      status: "error",
      err: e,
    });
  }
});

router.patch("/:id", checkAuthenticated, async (req, res) => {
  const userId = req.user;
  const docId = req.params.id;
  try {
    const doc = await Doc.findById(docId);
    if (doc == null) {
      return res.json({
        status: "fail",
        mssg: "no doc with this id",
      });
    } else if (doc.createdBy != userId) {
      return res.json({
        status: "fail",
        mssg: "not allowed",
      });
    }
    if (req.body.data != null) doc.data = req.body.data;
    if (req.body.title != null) doc.title = req.body.title;
    if (req.body.isPublic != null) doc.isPublic = req.body.isPublic;
    if (req.body.sharedList != null) {
      let correctUserId = [];
      let wrongUserId = [];
      for (let i = 0; i < req.body.sharedList.length; i++) {
        const user = await User.findOne({ userId: req.body.sharedList[i] });
        if (user == null) wrongUserId.push(req.body.sharedList[i]);
        else correctUserId.push(user._id);
      }
      if (wrongUserId.length != 0) {
        let mssg = "Wrong User Ids: ";
        wrongUserId.forEach((userId) => {
          mssg += userId;
          mssg += " ";
        });
        return res.json({
          status: "fail",
          mssg: mssg,
        });
      } else {
        if (!correctUserId.some((id) => id.toString() === req.user))
          correctUserId.push(ObjectId(req.user));
        doc.sharedTo = correctUserId;
      }
    }
    doc.updatedAt = new Date();
    await doc.save();
    return res.json({
      status: "success",
      doc: doc,
    });
  } catch (e) {
    return res.json({
      status: "error",
      err: e,
    });
  }
});

router.patch("/:id/feedback", checkAuthenticated, async (req, res) => {
  const docId = req.params.id;
  try {
    const doc = await Doc.findById(docId);
    if (doc == null) {
      return res.json({
        status: "fail",
        mssg: "no doc with this id",
      });
    }

    if (req.body.likedBy != null) {
      if (doc.likedBy.includes(req.body.likedBy)) {
        doc.likedBy = doc.likedBy.filter((user) => user != req.body.likedBy);
      } else {
        doc.likedBy.push(req.body.likedBy);
      }
    }

    if (req.body.comments != null) doc.comments = req.body.comments;

    await doc.save();
    return res.json({
      status: "success",
      likedBy: doc.likedBy,
      comments: doc.comments,
    });
  } catch (e) {
    return res.json({
      status: "error",
      err: e,
    });
  }
});

router.delete("/:id", checkAuthenticated, async (req, res) => {
  const userId = req.user;
  const docId = req.params.id;
  try {
    const doc = await Doc.findById(docId);
    if (doc == null) {
      return res.json({
        status: "fail",
        mssg: "no doc with this id",
      });
    } else if (doc.createdBy != userId) {
      return res.json({
        status: "fail",
        mssg: "not allowed",
      });
    }
    doc.files.forEach((path) => {
      try {
        fs.unlinkSync(path);
      } catch (e) {}
    });
    await doc.delete();
    return res.json({
      status: "success",
      mssg: "deleted",
    });
  } catch (e) {
    return res.json({
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
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".mp4") {
      return cb(res.status(400).end("only jpg, png, mp4 is allowed"), false);
    }
    cb(null, true);
  },
});

const upload = multer({ storage: storage }).single("file");

router.post("/:id/uploadfiles", (req, res) => {
  upload(req, res, async (e) => {
    if (e) {
      return res.json({
        status: "error",
        err: e,
      });
    }
    try {
      const doc = await Doc.findById(req.params.id);
      if (doc == null) {
        return res.json({
          status: "fail",
          mssg: "no doc found",
        });
      }
      doc.files.push(res.req.file.path);
      await doc.save();
    } catch (e) {
      return res.json({
        status: "error",
        err: e,
      });
    }

    return res.json({
      status: "success",
      url: res.req.file.path,
      filename: res.req.file.filename,
    });
  });
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
