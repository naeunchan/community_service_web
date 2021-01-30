//https://github.com/a-mean-blogger/board/blob/05033c3f5f54f5ce2bb403242c157781d233ae5d/index.js
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const morgan = require("morgan");
const dotenv = require("dotenv");
const passport = require("passport");
const flash = require("connect-flash");
const methodOverride = require("method-override");

dotenv.config();
const connect = require("./schemas");
const indexRouter = require("./routes");
const usersRouter = require("./routes/users");
const boardRouter = require("./routes/board");
const galleryRouter = require("./routes/gallery");
const passportConfig = require("./passport");
const util = require("./utils/util");
const app = express();
const PORT = 5000;
passportConfig();

app.use(expressLayouts);
app.set("views", path.join(__dirname, "views"));
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.set("view engine", "ejs");
app.set("port", process.env.PORT || PORT);
connect();

app.use(morgan("dev"));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

// Flash Message
app.use(flash());
app.use((req, res, next) => {
  res.locals.successMsg = req.flash("successMsg");
  res.locals.errorMsg = req.flash("errorMsg");
  res.locals.error = req.flash("error");
  next();
});

app.use(passport.initialize());
app.use(passport.session());

// Route
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/board", util.getPostQueryString, boardRouter);
app.use("/gallery", util.getPostQueryString, galleryRouter);

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});
