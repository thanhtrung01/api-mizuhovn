const config = require("./config");
const mongoose = require("mongoose");
const {
  UserSchema
} = require("../models/user.model.js");
const {
  BlogSchema
} = require("../models/blogs.model.js");

mongoose
  .connect(config.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  // .then(() => UserSchema.createIndexes())
  // .then(() => BlogSchema.createIndexes())
  .then(() => console.log("✅ Connected to MongoDB!"))
  .catch((error) =>
    console.log(`❗can not connect to database, ${error}`, error.message)
  );
