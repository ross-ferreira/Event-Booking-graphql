const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // check for valid token
  // 1st check the format is correct
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  // 2nd check there is a token
  const token = authHeader.split(" ")[1]; // split by index 1 for: Bearer !TOKEN!
  if (!token || token === "") {
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "somesecretkey");
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  req.userId = decodedToken.userId;
  next();
};

// because as with REST apis you can choose when to apply middleware whereas with graphql middleware is applied to every request
// you dont throw an error with the checks above
// rather just add metadata that can be later processed within the reolvers
