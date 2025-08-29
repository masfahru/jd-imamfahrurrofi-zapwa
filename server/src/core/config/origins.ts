/**
 * This file centralizes the logic for determining allowed CORS origins.
 * It reads from environment variables to build a list of trusted origins,
 * including the primary web application and any specified Chrome extensions.
 */

// Get the client URL from environment variables, with a fallback for local development.
const webAppOrigin = process.env.CLIENT_URL || "http://localhost:5173";

// Initialize the list of allowed origins with the web app's origin.
export const allowedOrigins = [webAppOrigin];

// Read Chrome extension IDs from environment variables.
const chromeExtensionIds = process.env.CHROME_EXTENSION_IDS;

// If extension IDs are provided, parse them and add their origins to the list.
if (chromeExtensionIds) {
  const extensionOrigins = chromeExtensionIds
    .split(',') // Split the string by commas
    .map(id => id.trim()) // Trim whitespace from each ID
    .filter(id => id) // Filter out any empty strings
    .map(id => `chrome-extension://${id}`); // Format as a Chrome extension origin

  // Add the generated extension origins to the main list.
  allowedOrigins.push(...extensionOrigins);
}
