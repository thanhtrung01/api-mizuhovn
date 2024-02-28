const mongoose = require("mongoose");
const validator = require("validator");
const CategorySchema = mongoose.Schema({
  category1:{
    type: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
  },
  slugCategory1:{
    type: String
  },
},
{ timestamps: true });


module.exports = mongoose.model("category1", CategorySchema);
