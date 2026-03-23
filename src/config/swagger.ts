import swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'DD Consent API',
    version: '1.0.0',
    description:
      'API documentation for the Dynamic Digital Consent Management System',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['fullName', 'email', 'password'],
        properties: {
          fullName: {
            type: 'string',
            example: 'Emily Okongo',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'emily@example.com',
          },
          password: {
            type: 'string',
            example: 'SecurePass123',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'emily@example.com',
          },
          password: {
            type: 'string',
            example: 'SecurePass123',
          },
        },
      },
      AuthSuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Login successful',
          },
          data: {
            type: 'object',
            properties: {
              token: {
                type: 'string',
                example: 'jwt.token.here',
              },
              user: {
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                    example: 1,
                  },
                  fullName: {
                    type: 'string',
                    example: 'Emily Okongo',
                  },
                  email: {
                    type: 'string',
                    example: 'emily@example.com',
                  },
                  role: {
                    type: 'string',
                    example: 'USER',
                  },
                  mfaEnabled: {
                    type: 'boolean',
                    example: false,
                  },
                },
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Validation failed',
          },
        },
      },
    },
  },
}

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts'],
}

export const swaggerSpec = swaggerJSDoc(options)