import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Protect routes middleware
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('No Authorization header');
      return res.status(401).json({
        success: false,
        message: 'No authorization header found'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('Invalid token format');
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded);

      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('User not found for token:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Add user info to request
      req.user = user;
      req.token = token;
      console.log('Authentication successful for user:', user.email);
      next();
      
    } catch (err) {
      console.log('Token verification failed:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Professor only middleware
export const professorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'professor') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Professor only.',
    });
  }
};

// Role authorization middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }
    
    next();
  };
};