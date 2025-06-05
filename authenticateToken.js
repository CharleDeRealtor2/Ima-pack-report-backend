// middleware/authenticateToken.js
import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header is present and valid
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token provided. Access denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info to the request object
    req.user = decoded;

    // Proceed to the next middleware or route
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Invalid or expired token.' });
  }
};

export default authenticateToken;
