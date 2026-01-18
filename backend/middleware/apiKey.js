/**
 * API Key Middleware
 * Validates API key in request header for additional security
 * 
 * Usage:
 * - Add to .env: API_KEY=your-secret-api-key-here
 * - Client must send: x-api-key: your-secret-api-key-here in headers
 */

const apiKeyAuth = (req, res, next) => {
  // Skip API key check for development environment if desired
  if (process.env.NODE_ENV === "development" && !process.env.REQUIRE_API_KEY) {
    return next();
  }

  const apiKey = req.headers["x-api-key"];
  const validApiKey = process.env.API_KEY;

  // If no valid API key is configured, skip validation
  if (!validApiKey) {
    console.warn("⚠️  Warning: No API_KEY configured in environment");
    return next();
  }

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "API key is required",
      error: "Missing x-api-key header",
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({
      success: false,
      message: "Invalid API key",
      error: "The provided API key is not valid",
    });
  }

  next();
};

module.exports = apiKeyAuth;
