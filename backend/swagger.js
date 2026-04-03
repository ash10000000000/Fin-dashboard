const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const { COOKIE_NAME } = require('./src/utils/constants');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description: 'REST API for finance data processing and access control.',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: COOKIE_NAME,
        },
      },
      schemas: {
        SuccessEnvelope: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {},
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        Unauthorized: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Unauthorized' },
          },
        },
        Forbidden: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Forbidden' },
          },
        },
        TooManyRequests: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: {
              type: 'string',
              example: 'Too many requests. Please try again later.',
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, 'src', 'routes', '*.js')],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
