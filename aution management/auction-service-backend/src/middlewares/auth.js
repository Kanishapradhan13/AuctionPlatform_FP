// Authentication middleware for microservices
// In production, this would call the User Service to verify the user

async function checkSeller(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User ID required in x-user-id header' });
    }

    // In production, call User Service to verify seller status
    // For now, we'll do a simplified check
    if (process.env.NODE_ENV === 'production') {
      try {
        const response = await fetch(`${process.env.USER_SERVICE_URL}/api/users/${userId}`);

        if (!response.ok) {
          return res.status(401).json({ error: 'Invalid user' });
        }

        const user = await response.json();

        if (!user.is_verified || user.role !== 'SELLER') {
          return res.status(403).json({ error: 'Only verified sellers can create auctions' });
        }

        req.user = user;
      } catch (error) {
        console.error('Error calling User Service:', error);
        return res.status(500).json({ error: 'Authentication service unavailable' });
      }
    } else {
      // Development mode - allow any user ID
      req.user = { id: userId, role: 'SELLER', is_verified: true };
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

function checkOwnership(req, res, next) {
  // Ownership check will be done in controller
  next();
}

module.exports = { checkSeller, checkOwnership };
