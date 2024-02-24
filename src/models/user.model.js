const mongoose = require("mongoose");
const validator = require("validator");
const UserSchema = mongoose.Schema({
  gender: {
    type: String,
    enum: ["Nam", "Nữ"],
  },
  name: {
    type: String,
  },
  level:{
    type: String,
    default: "1"
  },
  idUser: {
    type: String,
  },
  birthDate: {
    type: String,
  },
  idNumber: {
    type: String,
    allowNull: false,
  },
  issuedBy: {
    type: String,
  },
  dateRange: {
    type: String,
  },// ngày cấp 
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  district: {
    type: String,
  },
  ward: {
    type: String,
  },
  otherDocuments: {
    type: String,
  },
 
  username: {
    type: String,
  },
  phoneNumber: {
    type: String,
    // unique: true,
  },
  password: {
    type: String,
    trim: true,
    minlength: 4,
    validate(value) {
      if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
        throw new Error("Mật khẩu phải chứa ít nhất một chữ cái và một số");
      }
    },
    private: true, //
  },
  email: {
    type: String,
    // unique: true,
  },
  level: {
    type: String,
    default: "1",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isStaff: {
    type: Boolean,
    default: false,
  },


  avatar: {
    type: Array,
    required: false,
    default: [],
  },
},
{ timestamps: true });


module.exports = mongoose.model("user", UserSchema);
