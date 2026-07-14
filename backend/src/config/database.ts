import mongoose from "mongoose";

import { config } from "./app";
import { logger } from "../helpers/logger";

export class Database {
  private connected = false;

  async connect(uri: string = config.databaseUrl): Promise<void> {
    if (this.connected) {
      logger.info("Database already connected");
      return;
    }

    try {
      await mongoose.connect(uri);
      this.connected = true;
      logger.info("Connected to database via Mongoose");
    } catch (error) {
      logger.error("Failed to connect to database", { error });
      this.connected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      await mongoose.disconnect();
      this.connected = false;
      logger.info("Disconnected from database");
    } catch (error) {
      logger.error("Error disconnecting from database", { error });
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  resetConnectionState(): boolean {
    this.connected = false;
    return this.connected;
  }
}

export const database = new Database();
