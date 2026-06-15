const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  predictRentPrice,
  bulkPriceInsights,
  generateDescription,
} = require("../controllers/aiController");

router.post("/predict-price", authMiddleware, predictRentPrice);
router.post("/bulk-insights", authMiddleware, bulkPriceInsights);
router.post("/generate-description", authMiddleware, generateDescription);
module.exports = router;
