const API_BASE = "http://localhost:5000";
const PLACEHOLDER = "https://via.placeholder.com/600x320?text=Property";
export const getImageUrl = (imagePath) => {
  if (!imagePath) return PLACEHOLDER;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `${API_BASE}${imagePath}`;
};
export const PLACEHOLDER_IMAGE = PLACEHOLDER;
