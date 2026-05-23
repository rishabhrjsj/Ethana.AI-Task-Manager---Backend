require('dotenv').config();

const parseFrontendUrls = () => {
  const raw = process.env.FRONTEND_URL || 'http://localhost:5173';
  return raw.split(',').map((url) => url.trim()).filter(Boolean);
};

const frontendUrls = parseFrontendUrls();

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: frontendUrls.length === 1 ? frontendUrls[0] : frontendUrls,
};
