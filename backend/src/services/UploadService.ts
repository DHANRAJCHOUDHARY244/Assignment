import { spawn } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import {
  mkdir,
  open,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { pipeline } from "node:stream/promises";

import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

import { config } from "../config/app";
import { UPLOAD } from "../constants/upload";
import { HTTP_STATUS } from "../constants/httpStatus";
import { BaseService } from "./BaseService";

type UploadMeta = {
  id: string;
  filename: string;
  totalSize: number;
  mimeType: string;
  received: number;
};

export type UploadResult = {
  url: string;
  thumbnailUrl: string;
  path: string;
  thumbnailPath: string;
};

export class UploadService extends BaseService {
  private root = path.join(process.cwd(), "uploads");
  private chunkDir = path.join(this.root, "chunks");
  private videoDir = path.join(this.root, "videos");
  private thumbDir = path.join(this.root, "thumbs");

  async ensureDirs(): Promise<void> {
    await Promise.all([
      mkdir(this.chunkDir, { recursive: true }),
      mkdir(this.videoDir, { recursive: true }),
      mkdir(this.thumbDir, { recursive: true }),
    ]);
  }

  private metaPath(id: string): string {
    return path.join(this.chunkDir, `${id}.json`);
  }

  private partPath(id: string): string {
    return path.join(this.chunkDir, `${id}.part`);
  }

  private extFromName(filename: string, mimeType: string): string {
    const ext = path.extname(filename).toLowerCase();
    if (UPLOAD.VIDEO_EXT.includes(ext as (typeof UPLOAD.VIDEO_EXT)[number])) {
      return ext;
    }
    if (mimeType === "video/webm") return ".webm";
    if (mimeType === "video/quicktime") return ".mov";
    return ".mp4";
  }

  publicUrl(relativeFromUploads: string): string {
    return `${config.app.url}/uploads/${relativeFromUploads.replace(/^\/+/, "")}`;
  }

  async initUpload(input: {
    filename: string;
    totalSize: number;
    mimeType: string;
  }): Promise<{ uploadId: string; chunkSize: number }> {
    await this.ensureDirs();

    if (input.totalSize > UPLOAD.MAX_BYTES) {
      this.fail("File exceeds maximum upload size of 2 GB", HTTP_STATUS.BAD_REQUEST);
    }

    const id = randomUUID();
    const meta: UploadMeta = {
      id,
      filename: input.filename,
      totalSize: input.totalSize,
      mimeType: input.mimeType,
      received: 0,
    };

    await writeFile(this.metaPath(id), JSON.stringify(meta), "utf8");
    await writeFile(this.partPath(id), Buffer.alloc(0));

    return { uploadId: id, chunkSize: UPLOAD.CHUNK_SIZE };
  }

  private async readMeta(id: string): Promise<UploadMeta> {
    try {
      const raw = await readFile(this.metaPath(id), "utf8");
      return JSON.parse(raw) as UploadMeta;
    } catch {
      this.fail("Upload session not found", HTTP_STATUS.NOT_FOUND);
    }
  }

  private async writeMeta(meta: UploadMeta): Promise<void> {
    await writeFile(this.metaPath(meta.id), JSON.stringify(meta), "utf8");
  }

  async appendChunk(
    uploadId: string,
    offset: number,
    chunk: Buffer,
  ): Promise<{ received: number; totalSize: number }> {
    const meta = await this.readMeta(uploadId);

    if (offset !== meta.received) {
      this.fail(
        `Unexpected offset ${offset}, expected ${meta.received}`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (offset + chunk.length > meta.totalSize) {
      this.fail("Chunk exceeds declared file size", HTTP_STATUS.BAD_REQUEST);
    }

    const handle = await open(this.partPath(uploadId), "r+");
    try {
      await handle.write(chunk, 0, chunk.length, offset);
    } finally {
      await handle.close();
    }

    meta.received = offset + chunk.length;
    await this.writeMeta(meta);

    return { received: meta.received, totalSize: meta.totalSize };
  }

  private runFfmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn(ffmpegInstaller.path, args, { stdio: "ignore" });
      proc.on("error", reject);
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg exited with code ${code}`));
      });
    });
  }

  async generateThumbnail(videoPath: string, thumbPath: string): Promise<void> {
    await this.runFfmpeg([
      "-ss",
      "00:00:00.001",
      "-i",
      videoPath,
      "-frames:v",
      "1",
      "-q:v",
      "2",
      "-y",
      thumbPath,
    ]);
  }

  async completeUpload(uploadId: string): Promise<UploadResult> {
    const meta = await this.readMeta(uploadId);

    if (meta.received !== meta.totalSize) {
      this.fail("Upload incomplete", HTTP_STATUS.BAD_REQUEST);
    }

    const part = await stat(this.partPath(uploadId));
    if (part.size !== meta.totalSize) {
      this.fail("Uploaded file size mismatch", HTTP_STATUS.BAD_REQUEST);
    }

    const ext = this.extFromName(meta.filename, meta.mimeType);
    const base = randomUUID();
    const videoFile = `${base}${ext}`;
    const thumbFile = `${base}.jpg`;
    const videoPath = path.join(this.videoDir, videoFile);
    const thumbPath = path.join(this.thumbDir, thumbFile);

    await rename(this.partPath(uploadId), videoPath);

    try {
      await this.generateThumbnail(videoPath, thumbPath);
    } catch {
      await rm(videoPath, { force: true });
      this.fail(
        "Could not generate thumbnail from video",
        HTTP_STATUS.UNPROCESSABLE,
      );
    }

    await Promise.all([
      rm(this.metaPath(uploadId), { force: true }),
    ]);

    const relativeVideo = `videos/${videoFile}`;
    const relativeThumb = `thumbs/${thumbFile}`;

    return {
      url: this.publicUrl(relativeVideo),
      thumbnailUrl: this.publicUrl(relativeThumb),
      path: relativeVideo,
      thumbnailPath: relativeThumb,
    };
  }

  async saveDirectUpload(input: {
    filename: string;
    mimeType: string;
    tempPath: string;
  }): Promise<UploadResult> {
    await this.ensureDirs();

    const ext = this.extFromName(input.filename, input.mimeType);
    const base = randomUUID();
    const videoFile = `${base}${ext}`;
    const thumbFile = `${base}.jpg`;
    const videoPath = path.join(this.videoDir, videoFile);
    const thumbPath = path.join(this.thumbDir, thumbFile);

    await pipeline(createReadStream(input.tempPath), createWriteStream(videoPath));
    await rm(input.tempPath, { force: true });

    try {
      await this.generateThumbnail(videoPath, thumbPath);
    } catch {
      await rm(videoPath, { force: true });
      this.fail(
        "Could not generate thumbnail from video",
        HTTP_STATUS.UNPROCESSABLE,
      );
    }

    const relativeVideo = `videos/${videoFile}`;
    const relativeThumb = `thumbs/${thumbFile}`;

    return {
      url: this.publicUrl(relativeVideo),
      thumbnailUrl: this.publicUrl(relativeThumb),
      path: relativeVideo,
      thumbnailPath: relativeThumb,
    };
  }
}

export const uploadService = new UploadService();
