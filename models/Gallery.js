const mongoose = require("mongoose");

const GallerySchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  img: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  hashtag: [{ type: String, unique: true }],
  name: {
    type: String,
  },
});

const Gallery = mongoose.model("Gallery", GallerySchema);

module.exports = Gallery;
