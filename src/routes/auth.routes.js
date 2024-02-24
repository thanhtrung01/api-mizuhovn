const express = require('express');
const userController = require('../controllers/user.controller');
const router = express.Router();
const upload = require("../middlewares/upload");

// router.post('/login', userController.login);
// // router.post('/register-user', userController.registerUser);
// router.post('/register-business', upload.Avatar('avatar'), userController.registerBusiness);
// // router.post('/send-opt', userController.sendOtp)
// // router.post('/reset-opt', userController.resetOtp)
// router.patch('/update-password', userController.resetPassword);

router.post('/login', userController.login);
router.post('/register', userController.register);
router.patch('/update-password', userController.resetPassword);

module.exports = router;
