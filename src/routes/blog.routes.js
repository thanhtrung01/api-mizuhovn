const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const blogController = require("../controllers/blog.controller")
const upload = require("../middlewares/upload")
const router = express.Router();
//Admin và nhân viên
router.post('/create', upload.Image('images'), blogController.createBlogs);
router.get('/', blogController.getAllBlogs)
router.get('/get-all', blogController.getAll)
router.get('/detail', blogController.getBlog)
router.get('/search', blogController.getBlogs)

router.patch('/update/:blogsId', upload.Image('images'), blogController.updateBlogs)
router.post('/delete/:blogsId', blogController.deleteBlogs)

module.exports = router;
