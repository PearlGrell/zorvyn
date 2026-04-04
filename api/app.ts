import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes';
import env from './config/environment.config';
import errorMiddleware from './middlewares/error.middleware';
import corsOptions from './config/cors.config';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.config';
import helmet from 'helmet';
import limiter from './config/rate-limit.config';
import hpp from 'hpp';
import morgan from 'morgan';
import prisma from './config/prisma.config';


const app = express();

app.use(helmet());
app.use(limiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(hpp());
app.use(cookieParser());
app.use(corsOptions);

app.use(morgan('dev'));


app.use('/api', router);

app.get('/api/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected', message: (error as Error).message });
    }
});


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorMiddleware);

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});