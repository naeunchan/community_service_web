const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
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
  hashtag: [{ type: String, unique: true }],
  name: {
    type: String,
  },
});

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
