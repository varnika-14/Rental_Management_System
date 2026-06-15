const mongoose = require("mongoose");
const Property = require("../models/Property");

// Add this at the top - for Mistral AI
const { Mistral } = require("@mistralai/mistralai");

let mistralClient = null;
if (process.env.MISTRAL_API_KEY) {
  mistralClient = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY,
  });
  console.log("Mistral AI client initialized");
} else {
  console.warn("MISTRAL_API_KEY not found in environment variables");
}

const parseOwnerId = (req) =>
  req.body?.ownerId || req.query?.ownerId || req.body?.owner;

const isOwnerAuthorized = (property, ownerId) =>
  ownerId && property.owner.toString() === ownerId.toString();

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

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json("Property not found");

    const ownerId = parseOwnerId(req);
    if (!isOwnerAuthorized(property, ownerId)) {
      return res.status(403).json("You are not allowed to edit this property");
    }

    const { title, description, type, rent, location, address } = req.body;
    const nextImages =
      req.files && req.files.length > 0
        ? req.files.map((file) => file.path)
        : property.images;

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        type,
        rent: Number(rent),
        location,
        address,
        images: nextImages,
      },
      { new: true },
    );

    res.json(updatedProperty);
  } catch (err) {
    console.log("Error updating property:", err);
    res.status(500).json("Error updating property");
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json("Property not found");

    const ownerId = parseOwnerId(req);
    if (!isOwnerAuthorized(property, ownerId)) {
      return res
        .status(403)
        .json("You are not allowed to delete this property");
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    console.log("Error deleting property:", err);
    res.status(500).json("Error deleting property");
  }
};

exports.naturalLanguageSearch = async (req, res) => {
  try {
    const { query } = req.body;

    console.log("NL Search received:", query);

    if (!query || query.trim().length < 3) {
      return res.status(400).json({
        error: "Please provide a detailed search query (minimum 3 characters)",
      });
    }

    const allProperties = await Property.find({});
    console.log(`Total properties in DB: ${allProperties.length}`);

    if (allProperties.length === 0) {
      return res.json({
        success: true,
        properties: [],
        aiInterpretation:
          "No properties available in the database. Please add properties first.",
        searchQuery: query,
        totalMatches: 0,
      });
    }

    if (!mistralClient) {
      console.log("Mistral AI not configured, using basic search");
      const searchRegex = new RegExp(
        query
          .split(" ")
          .filter((w) => w.length > 2)
          .join("|"),
        "i",
      );
      const matchedProperties = allProperties.filter(
        (p) =>
          p.title?.match(searchRegex) ||
          p.description?.match(searchRegex) ||
          p.location?.match(searchRegex) ||
          (p.amenities && p.amenities.match(searchRegex)),
      );

      return res.json({
        success: true,
        properties: matchedProperties,
        aiInterpretation: `Showing results for: "${query}" (Basic search mode)`,
        searchQuery: query,
        totalMatches: matchedProperties.length,
        mode: "basic",
      });
    }

    const propertiesData = allProperties.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      type: p.type,
      rent: p.rent,
      location: p.location,
      bedrooms: p.bedrooms || "Not specified",
      area: p.area || "Not specified",
      amenities: p.amenities || "",
      nearbyPlaces: p.nearbyPlaces || "",
      description: p.description?.substring(0, 200) || "",
    }));

    const prompt = `
      You are a smart property search assistant. A tenant wants to find a rental property.
      
      User's search request: "${query}"
      
      Available properties (${propertiesData.length} total):
      ${JSON.stringify(propertiesData, null, 2)}
      
      Analyze the user's request and return ONLY the IDs of properties that match their requirements.
      
      Consider:
      - Location preferences (city, area, nearby landmarks)
      - Budget (look for numbers like "25000", "30k", "lakh")
      - Property type (villa, apartment, house, PG, studio)
      - Bedroom count ("2BHK", "3 bedroom", "6 rooms")
      - Amenities (pool, parking, gym, wifi, AC, furniture)
      - Nearby places (metro, school, hospital, mall, market)
      
      Return ONLY valid JSON in this exact format:
      {
        "interpretation": "Brief 1-sentence summary of what user wants",
        "matchedPropertyIds": ["id1", "id2", "id3"]
      }
      
      If no properties match, return empty array for matchedPropertyIds.
      Only return the JSON, no other text.
    `;

    console.log("Calling Mistral AI...");

    const response = await mistralClient.chat.complete({
      model: "mistral-tiny",
      messages: [
        {
          role: "system",
          content: "You are a property search expert. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      maxTokens: 500,
    });

    console.log("Mistral AI response received");

    let result;
    try {
      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Failed to parse AI response");
    }

    let matchedProperties = [];
    if (result.matchedPropertyIds && result.matchedPropertyIds.length > 0) {
      const propertiesMap = new Map(
        allProperties.map((p) => [p._id.toString(), p]),
      );
      matchedProperties = result.matchedPropertyIds
        .map((id) => propertiesMap.get(id))
        .filter((p) => p);
    }

    console.log(`Found ${matchedProperties.length} matching properties`);

    res.json({
      success: true,
      properties: matchedProperties,
      aiInterpretation:
        result.interpretation ||
        `Found ${matchedProperties.length} properties matching your criteria`,
      searchQuery: query,
      totalMatches: matchedProperties.length,
      mode: "ai",
    });
  } catch (error) {
    console.error("NL Search Error:", error);

    try {
      const allProperties = await Property.find({});
      const searchRegex = new RegExp(
        req.body.query
          .split(" ")
          .filter((w) => w.length > 2)
          .join("|"),
        "i",
      );
      const matchedProperties = allProperties.filter(
        (p) =>
          p.title?.match(searchRegex) ||
          p.description?.match(searchRegex) ||
          p.location?.match(searchRegex),
      );

      res.json({
        success: false,
        properties: matchedProperties,
        aiInterpretation:
          "AI search encountered an issue. Showing basic text match results instead.",
        searchQuery: req.body.query,
        totalMatches: matchedProperties.length,
        mode: "fallback",
        error: error.message,
      });
    } catch (fallbackError) {
      res.status(500).json({ error: "Search failed. Please try again." });
    }
  }
};
