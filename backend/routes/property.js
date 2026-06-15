const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");
const {
  addProperty,
  getProperties,
  getOwnerProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  naturalLanguageSearch,
} = require("../controllers/propertyController");

router.post("/", upload.array("images", 10), addProperty);
router.get("/", getProperties);
router.get("/owner/:id", getOwnerProperties);
router.get("/:id", getPropertyById);
router.put("/:id", upload.array("images", 10), updateProperty);
router.delete("/:id", deleteProperty);
router.post("/natural-language-search", authMiddleware, naturalLanguageSearch);
module.exports = router;
