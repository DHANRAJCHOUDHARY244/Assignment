import { config } from "../config/app";
import { logger } from "../helpers/logger";
import { formatTimestamp, formatUptime } from "../utils/dayjs";
import { BaseController } from "./BaseController";

export class HealthController extends BaseController {
  private getBaseHealth() {
    return {
      status: "healthy",
      timestamp: formatTimestamp(),
      uptime: formatUptime(process.uptime()),
      environment: config.nodeEnv,
    };
  }

  basicHealth = this.handle(async (_req, res) => {
    try {
      this.ok(res, "Service is healthy", this.getBaseHealth());
    } catch (error) {
      logger.error("Health check failed", { error });
      throw error;
    }
  });
}

export const healthController = new HealthController();
