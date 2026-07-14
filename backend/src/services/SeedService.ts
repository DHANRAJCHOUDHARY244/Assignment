import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Video } from "../models/Video";
import { logger } from "../helpers/logger";
import { BaseService } from "./BaseService";

export type DummyVideo = {
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  likesCount: number;
  sharesCount: number;
  commentsCount: number;
  isActive: boolean;
  sortOrder: number;
};

export class SeedService extends BaseService {
  private getDummyPath(): string {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    return path.join(dir, "..", "data", "videos.dummy.json");
  }

  async loadDummyVideos(): Promise<DummyVideo[]> {
    const raw = await readFile(this.getDummyPath(), "utf8");
    return JSON.parse(raw) as DummyVideo[];
  }

  async seedVideos(options: { force?: boolean } = {}): Promise<number> {
    const existing = await Video.countDocuments();
    if (existing > 0 && !options.force) {
      logger.info(`Videos already seeded (${existing}). Skipping.`);
      return 0;
    }

    if (options.force) {
      await Video.deleteMany({});
    }

    const videos = await this.loadDummyVideos();
    await Video.insertMany(videos);
    logger.info(`Seeded ${videos.length} videos from dummy JSON`);
    return videos.length;
  }
}

export const seedService = new SeedService();
