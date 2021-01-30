//https://github.com/bradtraversy/node_passport_login 참고
module.exports = {
  checkAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("errorMsg", "로그인이 필요합니다!");
    res.redirect("/users/login");
  },

  noPermission: (req, res) => {
    req.flash("errorMsg", "접근 권한이 없습니다!");
    req.logout();
    res.redirect("/users/login");
  },
};
