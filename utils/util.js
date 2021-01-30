//https://github.com/a-mean-blogger/board/tree/88487987ae6e6b8297986896920fcd6f5fe63c53
let util = {};

util.getPostQueryString = function (req, res, next) {
  res.locals.getPostQueryString = function (isAppended = false, overwrites = {}) {
    let queryString = "";
    let queryArray = [];
    let searchType = overwrites.searchType
      ? overwrites.searchType
      : req.query.searchType
      ? req.query.searchType
      : "";
    let searchText = overwrites.searchText
      ? overwrites.searchText
      : req.query.searchText
      ? req.query.searchText
      : "";

    if (searchType) queryArray.push("searchType=" + searchType);
    if (searchText) queryArray.push("searchText=" + searchText);

    if (queryArray.length > 0) queryString = (isAppended ? "&" : "?") + queryArray.join("&");

    return queryString;
  };
  next();
};

module.exports = util;
