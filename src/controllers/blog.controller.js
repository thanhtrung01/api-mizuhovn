const BlogsSchema = require("../models/blogs.model");
const CategorySchema = require("../models/category.models");
const UserSchema = require("../models/user.model");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");
const createBlogs = async (req, res) => {
  try {
    const user = await UserSchema.findOne({ _id: req.user.id });
    let createData = {};
    if (req.body.title) {
      createData.title = req.body.title;
      const cleanedTitle = req.body.title.replace(/:/g, '');
      const slugs = slugify(cleanedTitle, { lower: true });
      const randomPart = uuidv4();
      const slug = `${slugs}-${randomPart}`;
      createData.slug = slug;
    }
    if (req.body.category) {
      createData.category = req.body.category;
    }
    if (user) {
      createData.author = user.name;
    }
    if (req.body.content) {
      createData.content = req.body.content;
    }
    if (req.files && req.files[0] && req.files[0].path) {
      createData.images = req.files[0].path;
    }
    if (Object.keys(createData).length === 0) {
      return res.status(400).json({
        ok: false,
        errMessage: "Không có dữ liệu để tạo mới.",
      });
    }
    if (createData.content=='<p><br></p>'||createData.content==null){
      return res.status(400).json({
        ok: false,
        errMessage: "Vui lòng nhập nội dung.",
      });
    }
    const created = await BlogsSchema.create(
      createData
    );
    return res.status(201).json({ message: "ok", created });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const itemsPerPage = 10;

    const { search } = req.query;
    const currentPage = parseInt(req.query.page) || 1;
    const skip = (currentPage - 1) * itemsPerPage;

    let query = {};
    if (search) {
      query = {
        $or: [
          { author: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ],
      };
    } else {
      query = {};
    }
    const blogs = await BlogsSchema.find(query).populate('category').sort({ createdAt: -1 });
    // .skip(skip)
    // .limit(itemsPerPage);
    return res.status(200).json({ blogs });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};

const getBlogsId = async (req, res) => {
  try {
    const { blogsId } = req.params;
    const blogs = await BlogsSchema.findOne({ _id: blogsId });
    return res.status(200).json({ blogs });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};
const getBlog = async (req, res) => {
  try {
    const { slug } = req.query;
    const blogs = await BlogsSchema.findOne({ slug: slug });
    return res.status(200).json({ blogs });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};
const getBlogs = async (req, res) => {
  try {
    const itemsPerPage = 10;

    const { search } = req.query;
    const currentPage = parseInt(req.query.page) || 1;
    const skip = (currentPage - 1) * itemsPerPage;
    console.log(search)
    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
      };
    } else {
      query = {};
    }
    const blogs = await BlogsSchema.find(query).sort({ createdAt: -1 });
    // .skip(skip)
    // .limit(itemsPerPage);
    console.log(blogs)
    return res.status(200).json(blogs);
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};
const deleteBlogs = async (req, res) => {
  try {
    const { blogsId } = req.params;
    console.log(blogsId);
    const blogs = await BlogsSchema.findOne({ _id: blogsId });
    if (!blogs) {
      return res.status(404).json({ error: "not find blogs" });
    }
    await BlogsSchema.findOneAndDelete({ _id: blogsId });
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};
const updateBlogs = async (req, res) => {
  try {
    const { blogsId } = req.params;
    let updatedData = {};
    console.log(req.body)
    if (req.body.category) {
      updatedData.category = req.body.category;
    }
    if (req.body.author) {
      updatedData.author = req.body.author;
    }
    if (req.body.content) {
      updatedData.content = req.body.content;
    }
    if (req.body.title) {
      updatedData.title = req.body.title;
      const cleanedTitle = req.body.title.replace(/:/g, '');
      const slugs = slugify(cleanedTitle, { lower: true });
      const randomPart = uuidv4();
      const slug = `${slugs}-${randomPart}`;
      updatedData.slug = slug;
    }
    if (req.files && req.files[0] && req.files[0].path) {
      updatedData.images = req.files[0].path;
    }
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        ok: false,
        errMessage: "Không có dữ liệu để cập nhật.",
      });
    }
    const user = await BlogsSchema.findByIdAndUpdate(blogsId, updatedData, {
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
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};
module.exports = {
  getBlogs,
  getBlog,
  getBlogsId,
  createBlogs,
  deleteBlogs,
  updateBlogs,
  getAllBlogs,
};
