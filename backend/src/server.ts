import { startServer } from "./app";
import { database } from "./config/database";
import { logger } from "./helpers/logger";

const server = await startServer();

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received, shutting down gracefully...`);
  await database.disconnect();
  process.exit(0);
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("unhandledRejection", (error: Error) => {
  logger.error("Unhandled Rejection", { error });
  process.exit(1);
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception", { error });
  process.exit(1);
});

export default server;
