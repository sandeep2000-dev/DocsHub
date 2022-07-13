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
    res.json({
      status: "success",
      data: docList,
    });
  } catch (e) {
    res.json({
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
    res.json({
      status: "success",
      docList: docList,
    });
  } catch (e) {
    res.json({
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
    await newDoc.save();
    res.json({
      status: "success",
      data: newDoc,
    });
  } catch (e) {
    res.json({
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
      res.json({
        status: "fail",
        mssg: "no doc with this id",
      });
    } else if (!doc.isPublic && doc.createdBy._id != userId) {
      res.json({
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
    res.json({
      status: "success",
      doc: data,
    });
  } catch (e) {
    res.json({
      status: "error",
      err: e,
    });
  }
});

router.get("/:id/edit", checkAuthenticated, async (req, res) => {
  const userId = req.user;
  const docId = req.params.id;
  try {
    const doc = await Doc.findById(docId);
    if (doc == null) {
      res.json({
        status: "fail",
        mssg: "no doc with this id",
      });
    } else if (doc.createdBy != userId) {
      res.json({
        status: "fail",
        mssg: "not allowed",
      });
    }
    const data = {
      _id: doc._id,
      title: doc.title,
      data: doc.data,
      isPublic: doc.isPublic,
    };
    res.json({
      status: "success",
      doc: data,
    });
  } catch (e) {
    res.json({
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
      res.json({
        status: "fail",
        mssg: "no doc with this id",
      });
    } else if (doc.createdBy != userId) {
      res.json({
        status: "fail",
        mssg: "not allowed",
      });
    }
    doc.data = req.body.data;
    doc.title = req.body.title;
    doc.isPublic = req.body.isPublic;
    doc.updatedAt = new Date();
    await doc.save();
    res.json({
      status: "success",
      doc: doc,
    });
  } catch (e) {
    res.json({
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
      res.json({
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
    res.json({
      status: "success",
      likedBy: doc.likedBy,
      comments: doc.comments,
    });
  } catch (e) {
    res.json({
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
      res.json({
        status: "fail",
        mssg: "no doc with this id",
      });
    } else if (doc.createdBy != userId) {
      res.json({
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
    res.json({
      status: "success",
      mssg: "deleted",
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
