import swaggerJsdoc from 'swagger-jsdoc';
import env from './environment.config';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Zorvyn API',
            version: '1.0.0',
            description: 'API documentation for the Zorvyn financial tracking application.',
            contact: {
                name: 'API Support',
            },
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./api/routes/*.ts', './api/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
