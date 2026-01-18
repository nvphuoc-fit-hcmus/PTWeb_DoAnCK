/**
 * Basic Auth middleware for protecting Swagger API Docs
 * Username: admin
 * Password: admin123 (change in production)
 */

const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="API Documentation"');
    return res.status(401).json({
      success: false,
      message: "Authentication required to access API documentation",
    });
  }

  try {
    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "utf-8"
    );
    const [username, password] = credentials.split(":");

    // Simple hardcoded credentials (should use env vars in production)
    const validUsername = process.env.DOCS_USERNAME || "admin";
    const validPassword = process.env.DOCS_PASSWORD || "admin123";

    if (username === validUsername && password === validPassword) {
      return next();
    }

    res.setHeader("WWW-Authenticate", 'Basic realm="API Documentation"');
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  } catch (error) {
    res.setHeader("WWW-Authenticate", 'Basic realm="API Documentation"');
    return res.status(401).json({
      success: false,
      message: "Invalid authentication format",
    });
  }
};

module.exports = basicAuth;
