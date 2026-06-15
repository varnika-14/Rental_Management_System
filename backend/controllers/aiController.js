const { Mistral } = require("@mistralai/mistralai");

if (!process.env.MISTRAL_API_KEY) {
  console.error(
    "CRITICAL CONFIG WARNING: MISTRAL_API_KEY is missing from process.env!",
  );
}

const mistralClient = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || "",
});

exports.predictRentPrice = async (req, res) => {
  try {
    const { location, propertyType, bedrooms, area, amenities, nearbyPlaces } =
      req.body;

    if (!location || !propertyType) {
      return res
        .status(400)
        .json({ error: "Location and property type are required" });
    }

    const prompt = `
      You are an expert real estate price predictor for India.
      Based on the following property details, suggest a FAIR MONTHLY RENT PRICE in Indian Rupees (₹).
      
      Property Details:
      - Location: ${location}
      - Property Type: ${propertyType}
      - Bedrooms: ${bedrooms || "Not specified"}
      - Area: ${area || "Not specified"} sq ft
      - Amenities: ${amenities?.join(", ") || "Basic amenities"}
      - Nearby: ${nearbyPlaces || "Not specified"}
      
      Consider:
      - Average rent in similar locations
      - Property type premium
      - Amenities value addition
      - Current market rates in India
      
      Return ONLY valid JSON in this exact format:
      {
        "predictedRent": number,
        "minRange": number,
        "maxRange": number,
        "confidence": "High" | "Medium" | "Low",
        "reasoning": "string explanation"
      }
    `;

    const response = await mistralClient.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content:
            "You are a real estate pricing expert. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      maxTokens: 500,
      responseFormat: { type: "json_object" },
    });

    const prediction = JSON.parse(response.choices[0].message.content);

    res.json({
      success: true,
      ...prediction,
      aiModel: "Mistral Large",
    });
  } catch (error) {
    console.error("AI Prediction Error Details:", error);
    res.status(500).json({
      error: "AI prediction failed",
      message: error.message,
    });
  }
};

exports.bulkPriceInsights = async (req, res) => {
  try {
    const { properties } = req.body;

    if (!properties || properties.length === 0) {
      return res.status(400).json({ error: "Properties array required" });
    }

    const prompt = `
      Analyze these ${properties.length} properties and provide market insights.
      Return ONLY valid JSON in this exact format:
      {
        "averageMarketRent": number,
        "hotLocation": "string",
        "valueLocation": "string",
        "insight": "string"
      }
      
      Properties data:
      ${JSON.stringify(properties, null, 2)}
    `;

    const response = await mistralClient.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content:
            "You are a real estate market analyst. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      maxTokens: 500,
      responseFormat: { type: "json_object" },
    });

    const insights = JSON.parse(response.choices[0].message.content);

    res.json({
      success: true,
      ...insights,
    });
  } catch (error) {
    console.error("AI Bulk Insights Error Details:", error);
    res.status(500).json({
      error: "Failed to get insights",
      message: error.message,
    });
  }
};
exports.generateDescription = async (req, res) => {
  try {
    const {
      title,
      propertyType,
      location,
      bedrooms,
      area,
      amenities,
      nearbyPlaces,
    } = req.body;

    const prompt = `
      Write a compelling, professional property listing description for:
      
      Title: ${title}
      Type: ${propertyType}
      Location: ${location}
      Bedrooms: ${bedrooms || "Not specified"}
      Area: ${area || "Not specified"} sq ft
      Amenities: ${amenities?.join(", ") || "Standard amenities"}
      Nearby: ${nearbyPlaces || "Convenient location"}
      
      Write an engaging 100-150 word description highlighting:
      1. Key features and USPs
      2. Location benefits
      3. Nearby facilities
      4. Ideal tenant profile
      
      Make it professional, attractive, and ready to publish.
    `;

    const response = await mistralClient.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content:
            "You are a professional real estate copywriter. Write engaging property descriptions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 300,
    });

    res.json({
      success: true,
      description: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Description generation error:", error);
    res.status(500).json({
      error: "Failed to generate description",
      message: error.message,
    });
  }
};
