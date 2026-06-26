import helmet from "helmet";
import cors from "cors";

export const securityMiddleware = (app) => {
  app.use(helmet());

  app.use(
    cors({
      origin: process.env.CLIENT_URL || "*",
      credentials: true,
    })
  );

  app.disable("x-powered-by");
};