const CustomerSchema = require("../models/customer.model");

const createCustomer = async (req, res) => {
  try {
    const {
      lastName,
      firstName,
      phoneNumber,
      email,
      website,
      currentMarket,
      currentSelling,
      orderVolume,
      detail,
      company,
    } = req.body;
    console.log(phoneNumber);
    const created = await CustomerSchema.create({
      lastName,
      firstName,
      phoneNumber: phoneNumber,
      email,
      website,
      currentMarket,
      currentSelling,
      orderVolume,
      detail,
      company,
    });

    return res.status(201).json(created);
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};

const getCustomer = async (req, res) => {
  try {
    const itemsPerPage = 10;

    const { search } = req.query;
    const currentPage = parseInt(req.query.page) || 1;
    const skip = (currentPage - 1) * itemsPerPage;

    let query = {};
    if (search) {
      query = {
        $or: [
          { email: { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } },
        ],
      };
    } else {
      query = {};
    }
    const customer = await CustomerSchema.find(query).sort({ createdAt: -1 });
    // .skip(skip)
    // .limit(itemsPerPage);
    return res.status(200).json({ customer });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    console.log(customerId);
    const customer = await CustomerSchema.findOne({ _id: customerId });
    if (!customer) {
      return res.status(404).json({ error: "not find customer" });
    }
    await CustomerSchema.findOneAndDelete({ _id: customerId });
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};
const updateCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    console.log(customerId);
    const customer = await CustomerSchema.findOne({ _id: customerId });
    if (!customer) {
      return res.status(404).json({ error: "not find customer" });
    }
     await CustomerSchema.findOneAndUpdate(
      { _id: customerId },
      { status: "done" }
    );
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    return res.status(404).json({ error: error });
  }
};
module.exports = { getCustomer, createCustomer, deleteCustomer, updateCustomer };
