const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number.parseInt(process.env.PORT, 10) || 3000,
  jwtSecret: process.env.JWT_SECRET,
  databasePath: process.env.DATABASE_PATH || './finance.db',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};

function validateConfig() {
  if (!config.jwtSecret || config.jwtSecret.length === 0) {
    throw new Error(
      'JWT_SECRET is required. Copy backend/.env.example to backend/.env and set JWT_SECRET to a long random string.'
    );
  }
}

module.exports = { config, validateConfig };
