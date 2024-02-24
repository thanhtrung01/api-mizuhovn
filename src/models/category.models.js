const mongoose = require("mongoose");
const validator = require("validator");
const CategorySchema = mongoose.Schema({
  category:{
    type: String,
    required: true
  },
  slugCategory:{
    type: String
  },
},
{ timestamps: true });


module.exports = mongoose.model("category", CategorySchema);
