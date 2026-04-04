import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes';
import env from './config/environment.config';
import loggerMiddleware from './middlewares/logger.middleware';
import errorMiddleware from './middlewares/error.middleware';
import corsOptions from './config/cors.config';
import path from 'path';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(corsOptions);

app.use(loggerMiddleware);

app.use('/api', router);

app.use(errorMiddleware);

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});