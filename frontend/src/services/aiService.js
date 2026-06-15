import API from "./api";

export const predictRentPrice = async (propertyDetails) => {
  try {
    const response = await API.post("/ai/predict-price", propertyDetails);
    return response.data;
  } catch (error) {
    console.error("AI Prediction Error:", error);
    throw error.response?.data || { error: "Prediction failed" };
  }
};

export const getBulkInsights = async (properties) => {
  try {
    const response = await API.post("/ai/bulk-insights", { properties });
    return response.data;
  } catch (error) {
    console.error("Bulk Insights Error:", error);
    throw error.response?.data || { error: "Failed to get insights" };
  }
};
