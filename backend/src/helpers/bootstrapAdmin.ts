import { config } from "../config/app";
import { logger } from "../helpers/logger";
import { authService } from "../services/AuthService";

export async function bootstrapDefaultAdmin(): Promise<void> {
  const result = await authService.ensureDefaultAdmin();

  if (result === "exists") {
    logger.info("Admin already exists — skipped default admin creation");
    return;
  }

  const action = result === "promoted" ? "promoted to admin" : "created";
  logger.info(`Default admin ${action} (${config.admin.email})`);
}
