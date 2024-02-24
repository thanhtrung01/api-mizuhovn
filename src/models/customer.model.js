const mongoose = require("mongoose");
const validator = require("validator");
const CustomerSchema = mongoose.Schema(
  {
    lastName: {
      type: String,
    },
    firstName: { type: String },

    phoneNumber: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      // unique: true,
    },
    website: {
      type: String,
    },
    company:{type: String,},
    currentMarket: {
      type: Array,
    },
    currentSelling: {
      type: Array,
    },
    orderVolume: {
      type: String,
    },
    detail: {
      type: String,
    },
    status: {
      type: String,
      default:'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("customer", CustomerSchema);
