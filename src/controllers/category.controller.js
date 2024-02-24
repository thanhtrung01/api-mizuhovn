const CategorySchema = require("../models/category.models");
const slugify = require("slugify");
const createCategory = async (req, res) => {
  try {
    const {
      category
    } = req.body;
    const slugCategory = slugify(category, { lower: true });
    const finalSlug = `${slugCategory}`;
    if (!category) {
      res.status(404).json({ error: 'Not Found' })
    }
    const created = await CategorySchema.create({
      category,
      slugCategory: finalSlug
    });
    console.log(created);
    return res.status(201).json({ message: "ok", created });
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
          { category: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ],
      };
    } else {
      query = {};
    }
    const category = await CategorySchema.find(query).sort({ createdAt: -1 });
    // .skip(skip)
    // .limit(itemsPerPage);
    return res.status(200).json({ category });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};

const getCategoryId = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await CategorySchema.findOne({ _id: categoryId });
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
    const category = await CategorySchema.findOne({ _id: categoryId });
    if (!category) {
      return res.status(404).json({ error: "not find category" });
    }
    await CategorySchema.findOneAndDelete({ _id: categoryId });
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};
const updateCategory = async (req, res) => {
  try {
    let updatedData = {};
    const categoryId = req.params.categoryId
    if (req.body.category) {
      updatedData.category = req.body.category;
      const slugCategorys = slugify(updatedData.category, { lower: true });
      const finalSlug = `${slugCategorys}`;
      updatedData.slugCategory = finalSlug
    }
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({
        ok: false,
        errMessage: "Không có dữ liệu để cập nhật.",
      });
    }
    const user = await CategorySchema.findByIdAndUpdate(categoryId, updatedData, {
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
};
