const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImagePath: {
    type: String,
    default: "uploads/dummy-profile-pic.png",
  },
  bookmarks: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Doc" }],
});

module.exports = mongoose.model("User", userSchema);
