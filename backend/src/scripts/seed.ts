import { database } from "../config/database";
import { bootstrapDefaultAdmin } from "../helpers/bootstrapAdmin";
import { logger } from "../helpers/logger";
import { seedService } from "../services/SeedService";

const force = process.argv.includes("--force");

try {
  await database.connect();

  const count = await seedService.seedVideos({ force });
  logger.info(count > 0 ? `Seeded videos: ${count}` : "Video seed skipped");

  await bootstrapDefaultAdmin();

  await database.disconnect();
  process.exit(0);
} catch (error) {
  logger.error("Seed failed", { error });
  await database.disconnect().catch(() => undefined);
  process.exit(1);
}
