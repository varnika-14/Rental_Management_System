const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  addProperty,
  getProperties,
  getOwnerProperties,
  getPropertyById,
} = require("../controllers/propertyController");

router.post("/", upload.array("images", 10), addProperty);
router.get("/", getProperties);
router.get("/owner/:id", getOwnerProperties);
router.get("/:id", getPropertyById);

module.exports = router;
