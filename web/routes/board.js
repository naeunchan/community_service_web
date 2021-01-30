//https://github.com/a-mean-blogger/board/tree/4edf060fb5786112aba6d76bbcb6b3952fcf7e65
const express = require("express");
const Post = require("../models/Post");
const { checkAuthenticated, noPermission } = require("../utils/auth");
const router = express();

// index page
router.get("/", checkAuthenticated, async (req, res) => {
  let searchQuery = createSearchQuery(req.query);
  let posts = await Post.find(searchQuery).populate("author").sort("-createdAt").exec();

  res.render("board/", {
    posts: posts,
    searchType: req.query.searchType,
    searchText: req.query.searchText,
  });
});

// 글쓰기 페이지 이동
router.get("/new", checkAuthenticated, (req, res) => {
  const post = req.flash("post")[0] || {};
  const error = req.flash("error")[0] || {};
  res.render("board/new", { post: post, error: error });
});

// create
router.post("/", checkAuthenticated, (req, res) => {
  req.body.author = req.user._id;
  req.body.name = req.user.name;
  Post.create(req.body, (err, post) => {
    if (err) {
      req.flash("errorMsg", "에러가 발생하였습니다!");
      return res.redirect("/board/new");
    }
    res.redirect("/board" + res.locals.getPostQueryString(false, { searchText: "" }));
  });
});

// read
router.get("/:id", (req, res) => {
  const userID = req.user._id;
  Post.findOne({
    _id: req.params.id,
  })
    .populate("author")
    .exec((err, post) => {
      if (err) {
        return res.json(err);
      }
      res.render("board/show", {
        post: post,
        userID: userID,
      });
    });
});

// 수정 버튼 클릭
router.get("/:id/edit", checkPermission, checkPermission, (req, res) => {
  const post = req.flash("post")[0];
  const error = req.flash("error")[0] || {};

  if (!post) {
    Post.findOne(
      {
        _id: req.params.id,
      },
      (err, post) => {
        if (err) {
          return res.json(err);
        }
        res.render("board/edit", { post: post, error: error });
      }
    );
  } else {
    post._id = req.params.id;
    res.render("board/edit", { post: post, error: error });
  }
});

// update
router.put("/:id", checkAuthenticated, checkPermission, (req, res) => {
  Post.findOneAndUpdate(
    {
      _id: req.params.id,
    },
    req.body,
    { runValidators: true },
    (err, post) => {
      if (err) {
        req.flash("post", req.body);
        return res.redirect("/board/" + req.params.id + "/edit");
      }
      res.redirect("/board/" + req.params.id);
    }
  );
});

// delete
router.delete("/:id", checkAuthenticated, checkPermission, (req, res) => {
  Post.deleteOne(
    {
      _id: req.params.id,
    },
    (err) => {
      if (err) {
        return res.json(err);
      }
      res.redirect("/board");
    }
  );
});

module.exports = router;

function checkPermission(req, res, next) {
  Post.findOne({ _id: req.params.id }, (err, post) => {
    if (err) {
      return res.json(err);
    }
    if (post.author != req.user.id) {
      return noPermission(req, res);
    }
    next();
  });
}

function createSearchQuery(queries) {
  let searchQuery = {};
  if (queries.searchType && queries.searchText && queries.searchText.length >= 2) {
    let searchTypes = queries.searchType.toLowerCase().split(",");
    let postQueries = [];

    if (searchTypes.indexOf("name") >= 0) {
      postQueries.push({ name: { $regex: new RegExp(queries.searchText, "i") } });
    }
    if (searchTypes.indexOf("content") >= 0) {
      postQueries.push({ content: { $regex: new RegExp(queries.searchText, "i") } });
    }
    if (searchTypes.indexOf("hashtag") >= 0) {
      postQueries.push({ hashtag: { $regex: new RegExp(queries.searchText, "i") } });
    }
    if (postQueries.length > 0) {
      searchQuery = { $or: postQueries };
    }
  }
  return searchQuery;
}
