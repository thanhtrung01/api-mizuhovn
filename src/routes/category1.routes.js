const express = require("express");
const categoryController = require("../controllers/category1.controller")
const upload = require("../middlewares/upload")
const router = express.Router();
//Admin và nhân viên
router.post('/create',categoryController.createCategory);
router.get('/get-category-1', categoryController.getAllCategory)
router.get('/get-allcategory-1', categoryController.getAllCategory1)
router.patch('/update/:categoryId', categoryController.updateCategory)
router.post('/delete/:categoryId', categoryController.deleteCategory)

module.exports = router;
