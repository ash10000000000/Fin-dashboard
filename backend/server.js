const http = require('http');
const { validateConfig, config } = require('./src/config');
const { closeDb, getDb } = require('./db');
const { app } = require('./app');

validateConfig();
getDb();

const server = http.createServer(app);

server.listen(config.port);

function gracefulShutdown(signal) {
  server.close(() => {
    closeDb();
    process.stdout.write(`Server closed after ${signal}. Database connection closed.\n`);
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
