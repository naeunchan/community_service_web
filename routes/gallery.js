const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { checkAuthenticated, noPermission } = require("../utils/auth");
const Gallery = require("../models/Gallery");

const router = express();

try {
  fs.readdirSync("uploads");
} catch (err) {
  console.log("uploads 폴더를 생성합니다...");
  fs.mkdirSync("uploads");
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// index page
router.get("/", checkAuthenticated, async (req, res) => {
  let searchQuery = createSearchQuery(req.query);
  let galleries = await Gallery.find(searchQuery).populate("author").sort("-createdAt").exec();

  res.render("gallery/", {
    galleries: galleries,
    searchType: req.query.searchType,
    searchText: req.query.searchText,
  });
});

// 업로드 페이지 이동
router.get("/new", checkAuthenticated, (req, res) => {
  const gallery = req.flash("gallery")[0] || {};
  const error = req.flash("error")[0] || {};
  res.render("gallery/new", { gallery: gallery, error: error });
});

//create;
router.post("/", checkAuthenticated, upload.single("img"), (req, res) => {
  Gallery.create(
    {
      author: req.user._id,
      name: req.user.name,
      title: req.body.title,
      hashtag: req.body.hashtag,
      img: `/img/${req.file.filename}`,
      content: req.body.content,
    },
    (err) => {
      if (err) {
        req.flash("errorMsg", "에러가 발생하였습니다!");
        return res.redirect("/gallery/new");
      }
      res.redirect("/gallery" + res.locals.getPostQueryString(false, { searchText: "" }));
    }
  );
});

// read
router.get("/:id", (req, res) => {
  const userID = req.user._id;
  Gallery.findOne({
    _id: req.params.id,
  })
    .populate("author")
    .exec((err, gallery) => {
      if (err) {
        return res.json(err);
      }
      res.render("gallery/show", {
        gallery: gallery,
        userID: userID,
      });
    });
});

// 수정 버튼 클릭
router.get("/:id/edit", checkAuthenticated, checkPermission, (req, res) => {
  const gallery = req.flash("gallery")[0];

  if (!gallery) {
    Gallery.findOne(
      {
        _id: req.params.id,
      },
      (err, gallery) => {
        if (err) {
          return res.json(err);
        }
        res.render("gallery/edit", { gallery: gallery });
      }
    );
  } else {
    gallery._id = req.params.id;
    res.render("gallery/edit", { gallery: gallery });
  }
});

// update
router.put("/:id", checkAuthenticated, checkPermission, upload.single("img"), (req, res) => {
  const id = req.params.id;
  Gallery.findOneAndUpdate(
    {
      _id: id,
    },
    {
      title: req.body.title,
      content: req.body.content,
      img: `/img/${req.file.filename}`,
    },
    { runValidators: true },
    (err, gallery) => {
      if (err) {
        req.flash("gallery", req.body);
        return res.redirect("/gallery/" + req.params.id + "/edit");
      }
      res.redirect("/gallery/" + id);
    }
  );
});

// delete
router.delete("/:id", checkAuthenticated, checkPermission, (req, res) => {
  Gallery.deleteOne(
    {
      _id: req.params.id,
    },
    (err) => {
      if (err) {
        return res.json(err);
      }
      res.redirect("/gallery");
    }
  );
});
module.exports = router;

function checkPermission(req, res, next) {
  Gallery.findOne({ _id: req.params.id }, (err, gallery) => {
    if (err) {
      return res.json(err);
    }
    if (gallery.author != req.user.id) {
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
