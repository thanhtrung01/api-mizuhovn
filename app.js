const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const unless = require("express-unless");
const bodyParser = require("body-parser");
const path = require("path");
const config = require("./src/config/config"); 
const cookieSession = require("cookie-session");
const auth = require("./src/middlewares/auth");
const accessCors = require("./src/middlewares/constant");
// const swaggerUi = require('swagger-ui-express');
// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// const { Cors } = require('./middlewares/cors');
const corsOptions = {
  // origin: [
  //   config.CLIENT_URL,
  //   "http://127.0.0.1:3000",
  //   "http://localhost:3000",
  //   "http://localhost:8080"
  //   ,
  // ],
  origin:"*",
  credentials: true,
};
// const swaggerDocument = require('./api/swagger.json')
// app.use("/test-api", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
// AUTH VERIFICATION AND UNLESS
auth.verifyToken.unless = unless;

app.use(
  session({
    secret: config.GOOGLE_CLIENT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/api/v1/auth", require("./src/routes/auth.routes"));
app.use("/api/v1/category", require("./src/routes/category.routes"))
app.use("/api/v1/user", require("./src/routes/user.routes"));
app.use("/api/v1/customer", require("./src/routes/customer.routes"));
app.use("/api/v1/blog", require("./src/routes/blog.routes"));

app.get("/", (req, res) => {
  res.json({ msg: "Welcome to my API shopping" });
});

module.exports = app;
