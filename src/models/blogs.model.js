const mongoose = require("mongoose");
const validator = require("validator");
const BlogsSchema = mongoose.Schema({
  title:{
    type: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
  },
  category1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category1',
  },
  slug:{
    type: String
  },
  author:{
    type: String
  },
  content:{
    type: String
  },
  images: {
    type: Array,
    required: false,
    default: [],
  },
},
{ timestamps: true });


module.exports = mongoose.model("blog", BlogsSchema);
