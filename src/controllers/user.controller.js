const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserSchema = require("../models/user.model");
const auth = require("../middlewares/auth");
const config = require("../config/config");
const { validateEmail } = require("../validates/auth.validate");
const { sendMail } = require("../utils/mailer");

const generateRandomString = (length) => {
  const characters = "0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};
const register = async (req, res) => {
  try {
    const { name, username, password, isAdmin, isStaff } = req.body;
    console.log(isStaff)
    if (!(name && username && password)) {
      return res.status(400).json({
        oke: false,
        errMessage: "Thiếu tên người dùng, mật khẩu!",
      });
    }
    const users = await UserSchema.findOne({ username });
    if (users) {
      return res.status(400).json({
        oke: false,
        errMessage: " username đã được sử dụng!",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        oke: false,
        errMessage: "Mật khẩu phải lớn hơn 6 kí tự!",
      });
    }
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
   
    const newUser = new UserSchema({
      name: name,
      username: username,
      password: passwordHash,
      isStaff: isStaff,
      isAdmin: isAdmin,
    });
    await newUser.save();
    res.status(200).json({
      oke: true,
      message: "Bạn đã tạo tài khoản thành công! 🎉'",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errMessage: error.message });
  }
};

const referralCode = async (req, res) => {
  try {
    const referral = {};
    const user = await UserSchema.findOne({ _id: req.user.id });
    const refUser = await UserSchema.findOne({ idUser: user.idRef });
    const numRef = await UserSchema.find({ idRef: user.idUser })
      .select("name idRef idUser")
      .exec();
    const numTeams = await UserSchema.find({ idRef: user.idRef })
      .select("name idRef idUser")
      .exec();
    if (!user) {
      return res.status(404).json({ errMessage: "Không tìm thấy người dùng" });
    }
    if (!refUser) {
      return res.status(404).json({ errMessage: "Không tìm team" });
    }
    if (user && refUser) {
      referral.nameUser = user.name;
      referral.idUser = user.idUser;
      referral.numRef = numRef;
      referral.nameRef = refUser.name;
      referral.idRef = user.idRef;
      referral.numTeams = numTeams;
    }
    return res.status(200).json(referral);
  } catch (error) {
    return res.status(500).json({ errMessage: error.message });
  }
};

const registerAdmin = async (req, res) => {
  try {
    const { name, password, username } = req.body;
    if (!(username && password)) {
      return res.status(400).json({
        oke: false,
        errMessage: "Thiếu tên người dùng, mật khẩu!",
      });
    }
    if (!username) {
      return res.status(400).json({
        oke: false,
        errMessage: "Vui lòng nhập username!",
      });
    }
    const users = await UserSchema.findOne({ username });

    if (users) {
      return res.status(400).json({
        oke: false,
        errMessage: " Username đã được sử dụng!",
      });
    }
    if (!password.match(/\d/) || !password.match(/[a-zA-Z]/)) {
      return res.status(400).json({
        oke: false,
        errMessage: "Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số!",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        oke: false,
        errMessage: "Mật khẩu phải lớn hơn 6 kí tự!",
      });
    }
    let idUser;
    do {
      idUser = generateRandomString(5);
      checkIdUser = await UserSchema.findOne({ idUser });
    } while (checkIdUser);

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const newUser = new UserSchema({
      name: name,
      username: username,
      password: passwordHash,
      idUser: idUser,
      isStaff: true,
    });
    await newUser.save();
    res.status(200).json({
      oke: true,
      message: "Bạn đã tạo tài khoản thành công! 🎉'",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errMessage: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!(username && password)) {
    return res.status(400).send({
      ok: false,
      errMessage: "Vui lòng điền tất cả các thông tin cần thiết!",
    });
  }

  try {
    const user = await UserSchema.findOne({ username });
    if (!user) {
      return res.status(400).send({
        ok: false,
        errMessage: "Tài khoản không tồn tại!",
      });
    }
    if (user.status == false) {
      return res.status(400).send({
        ok: false,
        errMessage: "Tài khoản đã bị khoá!",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).send({
        ok: false,
        errMessage: "Bạn đã nhập mật khẩu sai😞",
      });
    }

    const token = auth.generateToken(user._id, user.username);
    const expires_in = auth.expiresToken(token);

    user.password = undefined;
    user.__v = undefined;

    return res.status(200).send({
      ok: true,
      message: "Đăng nhập thành công! 🎉",
      user,
      token,
      expires_in,
    });
  } catch (err) {
    return res.status(500).send({
      ok: false,
      errMessage: "Đã xảy ra lỗi trong quá trình đăng nhập.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { username, password, newPassword } = req.body;
    if (!(username && password)) {
      return res
        .status(400)
        .json({ error: "Vui lòng điền tất cả các thông tin cần thiết!" });
    } else {
      const user = await UserSchema.findOne({ username });

      if (!user) {
        return res.status(400).send({
          ok: false,
          errMessage: "Tài khoản không tồn tại!",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).send({
          ok: false,
          errMessage: "Bạn đã nhập mật khẩu sai😞",
        });
      }
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(newPassword, salt);
      const updatePassword = await UserSchema.findOneAndUpdate(
        { username: username },
        { password: passwordHash }
      );
      return res.status(200).json({ data: updatePassword });
    }
  } catch (error) {
    return res.status(400).json({ error: error });
  }
};
const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        errMessage: "Token không hợp lệ hoặc người dùng không xác thực.",
      });
    }
    const userId = req.user ? req.user.id : null;
    const user = await UserSchema.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        ok: false,
        errMessage: "Không tìm thấy người dùng.",
      });
    }
    user.isAdmin = undefined;
    user.isStaff = undefined;
    user.password = undefined;
    user.__v = undefined;

    res.status(200).json({
      ok: true,
      user,
      bank,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      errMessage: "Lỗi trong quá trình lấy thông tin người dùng.",
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const {search} = req.query
    let query = {};
    if (search) {
      query = {
        $or: [
          { email: { $regex: search, $options: "i" },   username: { $ne: "adminone@admin.com" }, },
          { username: { $regex: search, $options: "i" },   username: { $ne: "adminone@admin.com" }, },
        ],
      };
    } else {
      query = {};
    }
    const users = await UserSchema.find(query).select("-password").sort("__v");
    

    const countAllUsers = users.length;

    return res.status(200).json({
      count: countAllUsers,
      user: users,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err.message });
  }
};

const searchStaff = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
          { idUser: { $regex: search, $options: "i" } },
        ],
      };
    } else {
      query = {
        $or: [{ isAdmin: true }, { isStaff: true }],
      };
    }

    const searchStaff = await UserSchema.find(query).sort({ createdAt: -1 });
    
    return res.status(200).json(searchStaff);
  } catch (error) {
    return res.status(400).json(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const checkUser = await UserSchema.findOne({ _id: userId });
    if (checkUser.isAdmin === true) {
      return res.status(400).json({
        ok: false,
        errMessage: "Không thể xoá",
      });
    }
    if (!checkUser) {
      return res.status(404).json({
        ok: false,
        errMessage: "Người dùng không tồn tại",
      });
    }
    await UserSchema.findOneAndDelete({ _id: userId });

    return res.status(200).json({
      ok: true,
      message: "Người dùng đã được xoá thành công!",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        errMessage: "Token không hợp lệ hoặc người dùng không xác thực.",
      });
    }
    const updatedData = {};
    const userId = req.user ? req.user.id : null;
    if (req.body.name) {
      updatedData.name = req.body.name;
    }
    if (req.body.address) {
      updatedData.address = req.body.address;
    }
    if (req.body.birthDate) {
      updatedData.birthDate = req.body.birthDate;
    }
    if (req.body.gender) {
      updatedData.gender = req.body.gender;
    }
    if (req.body.phoneNumber) {
      updatedData.phoneNumber = req.body.phoneNumber;
    }
    //Ngày cấp
    if (req.body.dateRange) {
      updatedData.dateRange = req.body.dateRange;
    }
    //cmnd
    if (req.body.idNumber) {
      updatedData.idNumber = req.body.idNumber;
    }
    if (req.body.city) {
      updatedData.city = req.body.city;
    }
    if (req.body.email) {
      updatedData.email = req.body.email;
    }
    // if (req.files && req.files.length > 0) {
    //   const avatarPaths = req.files.map(file => file.path);
    //   updatedData.avatar = avatarPaths;
    // }
    // if (req.files && req.files[0] && req.files[0].path) {
    //   updatedData.avatar = req.files[0].path;
    // }
    if (req.files && req.files[0] && req.files[0].path) {
      updatedData.frontImage = req.files[0].path;
    }
    if (req.files && req.files[0] && req.files[0].path) {
      updatedData.backImage = req.files[0].path;
      console.log("a", updatedData.backImage);
    }
    if (req.files && req.files[0] && req.files.path) {
      updatedData.portrait = req.files[0].path;
    }
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        ok: false,
        errMessage: "Không có dữ liệu để cập nhật.",
      });
    }
    const user = await UserSchema.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({
        ok: false,
        errMessage: "Không tìm thấy người dùng.",
      });
    }

    // user.isAdmin = undefined;
    // user.isStaff = undefined;
    // user.password = undefined;
    // user.__v = undefined;
    await user.save();
    res.status(200).json({
      ok: true,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      errMessage: "Lỗi trong quá trình lấy thông tin người dùng.",
    });
  }
};

const updateCMND_MT = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        errMessage: "Token không hợp lệ hoặc người dùng không xác thực.",
      });
    }
    const updatedData = {};
    const userId = req.user ? req.user.id : null;
    if (req.files && req.files[0] && req.files[0].path) {
      updatedData.frontImage = req.files[0].path;
    }
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        ok: false,
        errMessage: "Không có ảnh để cập nhật.",
      });
    }
    const user = await UserSchema.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({
        ok: false,
        errMessage: "Không tìm thấy người dùng.",
      });
    }

    // user.isAdmin = undefined;
    // user.isStaff = undefined;
    // user.password = undefined;
    // user.__v = undefined;
    await user.save();
    res.status(200).json({
      ok: true,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      errMessage: "Lỗi trong quá trình lấy thông tin người dùng.",
    });
  }
};

const updateCMND_MS = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        errMessage: "Token không hợp lệ hoặc người dùng không xác thực.",
      });
    }
    const updatedData = {};
    const userId = req.user ? req.user.id : null;
    if (req.files && req.files[0] && req.files[0].path) {
      updatedData.backImage = req.files[0].path;
    }
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        ok: false,
        errMessage: "Không có ảnh để cập nhật.",
      });
    }
    const user = await UserSchema.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({
        ok: false,
        errMessage: "Không tìm thấy người dùng.",
      });
    }

    // user.isAdmin = undefined;
    // user.isStaff = undefined;
    // user.password = undefined;
    // user.__v = undefined;
    await user.save();
    res.status(200).json({
      ok: true,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      errMessage: "Lỗi trong quá trình lấy thông tin người dùng.",
    });
  }
};
const updateCMND_CD = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        errMessage: "Token không hợp lệ hoặc người dùng không xác thực.",
      });
    }
    const updatedData = {};
    const userId = req.user ? req.user.id : null;
    if (req.files && req.files[0] && req.files[0].path) {
      updatedData.portrait = req.files[0].path;
    }
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        ok: false,
        errMessage: "Không có ảnh để cập nhật.",
      });
    }
    const user = await UserSchema.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({
        ok: false,
        errMessage: "Không tìm thấy người dùng.",
      });
    }

    // user.isAdmin = undefined;
    // user.isStaff = undefined;
    // user.password = undefined;
    // user.__v = undefined;
    await user.save();
    res.status(200).json({
      ok: true,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      errMessage: "Lỗi trong quá trình lấy thông tin người dùng.",
    });
  }
};

const updateCMND_MT_s = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserSchema.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({
        ok: false,
        errMessage: "Người dùng không tồn tại",
      });
    }
    const updatedData = {};
    if (req.files && req.files[0] && req.files[0].path) {
      updatedData.frontImage = req.files[0].path;
    }
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        ok: false,
        errMessage: "Không có ảnh để cập nhật.",
      });
    }
    const updatedUser = await UserSchema.findByIdAndUpdate(
      { _id: userId },
      updatedData,
      {
        new: true,
      }
    );
    // user.isAdmin = undefined;
    // user.isStaff = undefined;
    // user.password = undefined;
    // user.__v = undefined;
    await user.save();
    res.status(200).json({
      ok: true,
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      errMessage: "Lỗi trong quá trình lấy thông tin người dùng.",
    });
  }
};

const updateCMND_MS_s = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserSchema.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({
        ok: false,
        errMessage: "Người dùng không tồn tại",
      });
    }
    const updatedData = {};
    if (req.files && req.files[0] && req.files[0].path) {
      updatedData.backImage = req.files[0].path;
    }
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        ok: false,
        errMessage: "Không có ảnh để cập nhật.",
      });
    }
    const updatedUser = await UserSchema.findByIdAndUpdate(
      { _id: userId },
      updatedData,
      {
        new: true,
      }
    );
    // user.isAdmin = undefined;
    // user.isStaff = undefined;
    // user.password = undefined;
    // user.__v = undefined;
    await user.save();
    res.status(200).json({
      ok: true,
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      errMessage: "Lỗi trong quá trình lấy thông tin người dùng.",
    });
  }
};
const updateCMND_CD_s = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserSchema.findById({ _id: userId });
    if (!user) {
      return res.status(404).json({
        ok: false,
        errMessage: "Người dùng không tồn tại",
      });
    }
    const updatedData = {};
    if (req.files && req.files[0] && req.files[0].path) {
      updatedData.portrait = req.files[0].path;
    }
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        ok: false,
        errMessage: "Không có ảnh để cập nhật.",
      });
    }
    const updatedUser = await UserSchema.findByIdAndUpdate(
      { _id: userId },
      updatedData,
      {
        new: true,
      }
    );

    // user.isAdmin = undefined;
    // user.isStaff = undefined;
    // user.password = undefined;
    // user.__v = undefined;
    await user.save();
    res.status(200).json({
      ok: true,
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      errMessage: "Lỗi trong quá trình lấy thông tin người dùng.",
    });
  }
};
const getUserWithMail = async (req, res) => {
  const { username } = req.body;
  await User.getUserWithMail(username, (err, result) => {
    if (err) return res.status(404).send(err);

    const dataTransferObject = {
      name: result.name,
      avatar: result.avatar,
      username: result.username,
      color: result.color,
      username: result.username,
    };
    return res.status(200).send(dataTransferObject);
  });
};

const updateStaff = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserSchema.findById({ _id: userId });

    if (!user) {
      return res.status(404).json({
        ok: false,
        errMessage: "Người dùng không tồn tại",
      });
    }

    const updatedData = {};
    if (req.body.name) {
      updatedData.name = req.body.name;
    }
    if (req.body.address) {
      updatedData.address = req.body.address;
    }
    if (req.body.birthDate) {
      updatedData.birthDate = req.body.birthDate;
    }
    if (req.body.gender) {
      updatedData.gender = req.body.gender;
    }
    if (req.body.phoneNumber) {
      updatedData.phoneNumber = req.body.phoneNumber;
    }
    //Ngày cấp
    if (req.body.dateRange) {
      updatedData.dateRange = req.body.dateRange;
    }
    //cmnd
    if (req.body.idNumber) {
      updatedData.idNumber = req.body.idNumber;
    }
    if (req.body.city) {
      updatedData.city = req.body.city;
    }
    if (req.body.email) {
      updatedData.email = req.body.email;
    }
    if (req.body.password) {
      const pwd = req.body.password;
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(pwd, salt);
      updatedData.password = passwordHash;
    }
    if (req.body.isLook !== undefined) {
      updatedData.isLook = req.body.isLook;
    }
    console.log(req.body.isDongBang);
    if (req.body.isDongBang !== undefined) {
      updatedData.isDongBang = req.body.isDongBang;
      if (req.body.isDongBang === true) {
        freezeAdd(userId);
      }
      if (req.body.isDongBang === false) {
        freezeMinus(userId);
      }
    }
    if (req.files && req.files[0] && req.files[0].path) {
      updatedData.avatar = req.files[0].path;
    }

    const updatedUser = await UserSchema.findByIdAndUpdate(
      { _id: userId },
      updatedData,
      {
        new: true,
      }
    );

    return res.status(201).json({
      ok: true,
      message: "Cập nhật thành công!",
      user: updatedUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err.message });
  }
};
const freezeAdd = async (userId) => {
  try {
    const info = "add";
    const checkWaller = await WalletSchema.findOne({ userId });
    if (!checkWaller) {
      return res.status(404).json({ error: "not wallet" });
    }

    const countAmount = checkWaller.totalFreeze + checkWaller.money;

    await WalletSchema.findOneAndUpdate(
      { userId },
      { totalFreeze: countAmount, money: 0 }
    );
    await historyAddMinusMoney(userId, countAmount, info);
  } catch (error) {
    return res.status(400).json({ message: "no add points" });
  }
};
const freezeMinus = async (userId) => {
  try {
    const info = "minus";
    const checkWaller = await WalletSchema.findOne({ userId });
    if (!checkWaller) {
      return res.status(404).json({ error: "not wallet" });
    }

    const countAmount = checkWaller.totalFreeze + checkWaller.money;

    await WalletSchema.findOneAndUpdate(
      { userId },
      { totalFreeze: 0, money: countAmount }
    );
    await historyAddMinusMoney(userId, countAmount, info);
  } catch (error) {
    return res.status(400).json({ message: "no add points" });
  }
};
const createUser = async (req, res) => {
  // const images_url = req.files.map((image) => image.path);
  try {
    console.log(req.body);
    // const images_url = req.files[0].path;
    const salt = bcrypt.genSaltSync(10);

    if (req.user.isAdmin !== true) {
      return res.status(403).json({ message: "Bạn không phải admin" });
    }
    const newUser = await UserSchema.create({
      name: req.body.name,
      address: req.body.address,
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, salt),
      // avatar: images_url,
    });
    const getPoint = await ConfigStartPointSchema.findOne({
      _id: "65b14b54c499af1a505faefb",
    });
    await createWallet(newUser._id, getPoint.point);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

const updateRoleStaff = async (req, res) => {
  try {
    const { id } = req.params;
    let updatedData = {};
    if (req.body.isAdmin) {
      updatedData.isAdmin = req.body.isAdmin;
    }
    if (req.body.isStaff) {
      updatedData.isStaff = req.body.isStaff;
    }
    if (req.body.name) {
      updatedData.name = req.body.name;
    }
    if (req.body.password) {
      const pwd = req.body.password;
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(pwd, salt);
      updatedData.password = passwordHash;
    }
    await UserSchema.findOneAndUpdate(
      {
        _id: id,
      },
      updatedData,
      {
        new: true,
      }
    );

    return res.status(200).json({ status: "Cập nhật thành công" });
  } catch (error) {
    return res.status(500).json({ status: error });
  }
};

module.exports = {

  register,
  login,
  deleteUser,
  searchStaff,
  getAllUser,
  getUserWithMail,
  updateProfile,
  updateRoleStaff,
  // updateUser,
  updateStaff,
  createUser,
  getUserProfile,
  resetPassword,
  registerAdmin,
  referralCode,
};