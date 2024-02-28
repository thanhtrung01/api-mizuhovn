const express = require("express");
const categoryController = require("../controllers/category.controller")
const upload = require("../middlewares/upload")
const router = express.Router();
//Admin và nhân viên
router.post('/create',categoryController.createCategory);
router.get('/get-category', categoryController.getAllCategory)
router.get('/get-all', categoryController.getAllCategorys)
router.patch('/update/:categoryId', categoryController.updateCategory)
router.post('/delete/:categoryId', categoryController.deleteCategory)

module.exports = router;
