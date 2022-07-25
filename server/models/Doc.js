const mongoose = require("mongoose");

const docSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
  },
  files: [String],
  createdBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: () => new Date(),
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  likedBy: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      body: String,
      createdAt: { type: Date, dafault: () => new Date(), immutable: true },
      createdBy: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    },
  ],
  sharedTo: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Doc", docSchema);
