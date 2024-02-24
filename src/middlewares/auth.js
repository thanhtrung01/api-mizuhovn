const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const config = require("../config/config");

const generateToken = (id, email) => {
  const token = jwt.sign({ id, email }, config.ACCESS_TOKEN_SECRET, {
    expiresIn: '3y',
  });
  return token.toString();
};
const expiresToken = (token) => {
  const decodedToken = jwt.decode(token, { complete: true });
  if (!decodedToken || !decodedToken.payload.exp) {
    return null;
  }
  const expires_in = decodedToken.payload.exp * 1000;
  return expires_in.toString();
};

const verifyToken = async (req, res, next) => {
  try {
    if (!req.headers["authorization"])
      return res
        .status(401)
        .send({ errMessage: "Authorization token not found!" });

    const header = req.headers["authorization"];
    const token = header.split(" ")[1];

    jwt.verify(
      token,
      config.ACCESS_TOKEN_SECRET,
      async (err, verifiedToken) => {
        if (err)
          return res
            .status(401)
            .send({ errMessage: "Authorization token invalid", details: err });
        const user = await User.findById(verifiedToken.id);
        req.user = user;
        next();
      }
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateToken,
  expiresToken,
  verifyToken,
};
