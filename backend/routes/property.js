const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  addProperty,
  getProperties,
  getOwnerProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");

router.post("/", upload.array("images", 10), addProperty);
router.get("/", getProperties);
router.get("/owner/:id", getOwnerProperties);
router.get("/:id", getPropertyById);
router.put("/:id", upload.array("images", 10), updateProperty);
router.delete("/:id", deleteProperty);

module.exports = router;
