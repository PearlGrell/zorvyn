import cors from "cors";
import type { CorsOptions } from "cors";
import environmentConfig from "./environment.config";

const corsOptions: CorsOptions = {
    origin: environmentConfig.ENV === "production"
        ? process.env.FRONTEND_URL || "*"
        : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    maxAge: 86400,
};

export default cors(corsOptions);
