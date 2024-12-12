const jwt = require('jsonwebtoken');

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

  // If no token is found, send an unauthorized error
  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  // Verify the token using JWT secret key (replace 'your-secret-key' with your actual secret key)
  require('dotenv').config(); // Load environment variables
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    // If the token is valid, attach the user information to the request object
    req.user = user;  // user will be the decoded payload from the JWT
    next();  // Call the next middleware or route handler
  });
};

module.exports = authenticateToken;
