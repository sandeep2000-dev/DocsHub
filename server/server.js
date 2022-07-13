if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");

const User = require("./models/User");
const Doc = require("./models/Doc");
const docRouter = require("./routers/doc");
const userRouter = require("./routers/user");
const ObjectId = require("mongoose").Types.ObjectId;

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const app = express();

mongoose
  .connect("mongodb://localhost/docappdb")
  .then((db) => {
    console.log("connected to db");
  })
  .catch((e) => {
    console.log(e);
  });

app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: "userId" }, authenticateUser));
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, id));

app.use("/doc", docRouter);
app.use("/user", userRouter);

app.get("/", checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user).populate("bookmarks").exec();
    res.json({
      status: "success",
      data: {
        _id: user._id,
        name: user.name,
        userId: user.userId,
        profileImagePath: user.profileImagePath,
        bookmarks: user.bookmarks,
      },
    });
  } catch (e) {
    res.json({
      status: "error",
      err: e,
    });
  }
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.json({ status: "success" });
});

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.json({ status: "success" });
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local"),
  (req, res) => {
    res.json({
      status: "success",
      mssg: "authenticated successfully",
    });
  }
);

app.post("/register", async (req, res) => {
  try {
    if ((await User.findOne({ userId: req.body.userId })) != null) {
      return res.json({
        status: "fail",
        mssg: "UserId already taken",
      });
    }
    const hashsedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      userId: req.body.userId,
      password: hashsedPassword,
      name: req.body.name,
    });
    await user.save();
    res.json({
      status: "success",
      mssg: "Registered Successfully",
    });
  } catch (e) {
    console.log(e);
    res.json({
      status: "error",
      err: e,
    });
  }
});

app.delete("/logout", checkAuthenticated, (req, res, next) => {
  req.logOut((err) => {
    if (err) return next(err);
    res.json({
      status: "success",
      mssg: "logout successfully",
    });
  });
});

async function authenticateUser(userId, password, done) {
  try {
    const user = await User.findOne({ userId: userId });
    if (user == null) return done(null, false);
    if (!(await bcrypt.compare(password, user.password)))
      return done(null, false);
    return done(null, user);
  } catch (e) {
    return done(e);
  }
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  else
    res.json({
      status: "fail",
      mssg: "Not authenticated",
    });
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.json({
      status: "fail",
      mssg: "already logged in",
    });
  }
  next();
}

app.listen(4000);
