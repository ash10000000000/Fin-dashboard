const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const { config } = require('./src/config');
const { requestIdMiddleware } = require('./src/middleware/requestId');
const { globalLimiter } = require('./src/middleware/rateLimiter');
const { errorHandler } = require('./src/middleware/errorHandler');
const { swaggerSpec } = require('./swagger');
const authRoutes = require('./src/routes/auth.routes');
const recordsRoutes = require('./src/routes/records.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const usersRoutes = require('./src/routes/users.routes');

const app = express();

morgan.token('req-id', (req) => req.requestId || '-');
app.use(requestIdMiddleware);
app.use(morgan(':method :url :status :response-time ms :req-id'));

app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(globalLimiter);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);

app.use(errorHandler);

module.exports = { app };
