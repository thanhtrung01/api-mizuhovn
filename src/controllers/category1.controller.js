const CategorySchema1 = require("../models/category1.models");
const CategorySchema = require("../models/category.models");
const slugify = require("slugify");
const createCategory = async (req, res) => {
  try {
    const {
      category1,
      category
    } = req.body;
    const slugCategory = slugify(category1, { lower: true });
    const finalSlug = `${slugCategory}`;
    const existingCategory = await CategorySchema.findOne({ category: category });
    if (!existingCategory) {
      res.status(404).json({ error: 'Không tìm thấy danh mục' })
    }
    if (!category1) {
      res.status(404).json({ error: 'Vui lòng nhập tên danh mục' })
    }
    const created = await CategorySchema1.create({
      category1,
      category: existingCategory._id,
      slugCategory: finalSlug
    });
    console.log(created);
    return res.status(201).json({ message: "ok", created });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};
const getAllCategory1 = async (req, res) => {
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
          { category1: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ],
      };
    } else {
      query = {};
    }
    const category = await CategorySchema1.find(query);
    // .skip(skip)
    // .limit(itemsPerPage);
    return res.status(200).json({ category });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};

const getAllCategory = async (req, res) => {
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
          { category1: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ],
      };
    } else {
      query = {};
    }
    const category1 = await CategorySchema1.find(query).populate('category').sort({ createdAt: -1 });
    // .skip(skip)
    // .limit(itemsPerPage);
    return res.status(200).json({ category1 });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};

const getCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await CategorySchema1.findOne({ _id: categoryId });
    return res.status(200).json({ category });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};
const getCategory = async (req, res) => {
  try {
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(categoryId);
    const category = await CategorySchema1.findOne({ _id: categoryId });
    if (!category) {
      return res.status(404).json({ error: "not find category" });
    }
    await CategorySchema1.findOneAndDelete({ _id: categoryId });
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};
const updateCategory = async (req, res) => {
  try {
    let updatedData = {};
    const categoryId = req.params.categoryId
    if (req.body.category1) {
      updatedData.category1 = req.body.category1;
      if (!req.body.category1) {
        res.status(404).json({ error: 'Vui lòng nhập tên danh mục' })
      }
    }
    if (req.body.category) {
      const existingCategory = await CategorySchema.findOne({ category: req.body.category });
      if (!existingCategory) {
        res.status(404).json({ error: 'Không tìm thấy danh mục' })
      }
      updatedData.category = existingCategory._id;
    }


    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        ok: false,
        errMessage: "Không có dữ liệu để cập nhật.",
      });
    }
    const user = await CategorySchema1.findByIdAndUpdate(categoryId, updatedData, {
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
  getCategoryId,
  createCategory,
  deleteCategory,
  updateCategory,
  getAllCategory,
  getAllCategory1
};
