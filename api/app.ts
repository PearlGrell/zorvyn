import express from 'express';
import cookieParser from 'cookie-parser';
import router from './routes';
import env from './config/environment.config';
import errorMiddleware from './middlewares/error.middleware';
import corsOptions from './config/cors.config';
import helmet from 'helmet';
import limiter from './config/rate-limit.config';
import hpp from 'hpp';
import morgan from 'morgan';


const app = express();

app.use(helmet());
app.use(limiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(hpp());
app.use(cookieParser());
app.use(corsOptions);

app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Zorvyn API is running!');
});

app.use('/api', router);

app.use(errorMiddleware);

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});