const mongoose = require("mongoose");
const Property = require("../models/Property");

exports.addProperty = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { title, description, type, rent, location, address, owner } =
      req.body;

    const imagePaths = await Promise.all(
      (req.files || []).map((file) => Promise.resolve(file.path)),
    );
    const property = new Property({
      title,
      description,
      type,
      rent: Number(rent),
      location,
      address,
      owner,
      images: imagePaths,
    });

    await property.save();

    res.json("Property Added Successfully");
  } catch (err) {
    console.log(" BACKEND ERROR:", err);
    res.status(500).json(err.message);
  }
};

exports.getProperties = async (req, res) => {
  try {
    const { location, type, minRent, maxRent } = req.query;

    const query = {};

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (type) {
      query.type = type;
    }

    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }

    const properties = await Property.find(query);
    res.json(properties);
  } catch (err) {
    res.status(500).json("Error fetching properties");
  }
};

exports.getOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.params.id });
    res.json(properties);
  } catch (err) {
    console.log(err);
    res.status(500).json("Server Error");
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "owner",
      "name email",
    );
    if (!property) return res.status(404).json("Property not found");
    res.json(property);
  } catch (err) {
    res.status(500).json("Error fetching property");
  }
};
