import cookieParser from "cookie-parser";
import cors from "cors";
import express, { json, urlencoded, type Application } from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { config } from "./config/app";
import { database } from "./config/database";
import { bootstrapDefaultAdmin } from "./helpers/bootstrapAdmin";
import { logger } from "./helpers/logger";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { registerRoutes } from "./routes";
import { formatTimestamp } from "./utils/dayjs";

export class ServerApp {
  private initializeMiddlewares(app: Application): void {
    app.set("trust proxy", 1);

    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", "https:", "http:"],
            frameSrc: ["'none'"],
          },
        },
        crossOriginResourcePolicy: { policy: "cross-origin" },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
        noSniff: true,
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      }),
    );

    app.use(
      cors({
        origin: config.cors.length > 0 ? config.cors : false,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Upload-Offset"],
        exposedHeaders: [""],
      }),
    );

    app.use(json({ limit: "1mb" }));
    app.use(urlencoded({ extended: true, limit: "1mb" }));
    app.use(cookieParser());

    app.use(
      morgan((tokens, req, res) => {
        const ip = tokens["remote-addr"]?.(req, res) || "-";
        const url = tokens["url"]?.(req, res) || "-";
        const status = tokens["status"]?.(req, res) || "-";
        const userAgent = tokens["user-agent"]?.(req, res) || "-";

        return `info [${formatTimestamp()}] [${ip}] "${url}" ${status} "${userAgent}"`;
      }),
    );
  }

  private initializeRoutes(app: Application): void {
    app.use(
      "/uploads",
      (_req, res, next) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        next();
      },
      express.static(path.join(process.cwd(), "uploads")),
    );
    registerRoutes(app);
  }
  private initializeErrorHandling(app: Application): void {
    app.use(notFound);
    app.use(errorHandler);
  }

  create(): Application {
    const app = express();

    this.initializeMiddlewares(app);
    this.initializeRoutes(app);
    this.initializeErrorHandling(app);

    return app;
  }

  async start(): Promise<Application> {
    await database.connect();
    await bootstrapDefaultAdmin();

    const app = this.create();

    app.listen(config.port, () => {
      logger.info(`${config.app.name} server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Health check: ${config.app.url}/api/health`);
    });

    return app;
  }
}

export const serverApp = new ServerApp();
export const createApp = (): Application => serverApp.create();
export const startServer = async (): Promise<Application> => {
  try {
    return await serverApp.start();
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
};
