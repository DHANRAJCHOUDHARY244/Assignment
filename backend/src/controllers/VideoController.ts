import { videoService } from "../services/VideoService";
import { BaseController } from "./BaseController";

export class VideoController extends BaseController {
  list = this.handle(async (req, res) => {
    const data = await videoService.list({
      page: this.queryNumber(req, "page", 1),
      limit: this.queryNumber(req, "limit", 40),
    });
    this.ok(res, "Videos fetched", data);
  });

  getById = this.handle(async (req, res) => {
    const data = await videoService.getById(this.paramId(req));
    this.ok(res, "Video fetched", data);
  });

  like = this.handle(async (req, res) => {
    const data = await videoService.like({
      videoId: this.paramId(req),
      userId: req.user?.id ?? (req.body?.userId as string | undefined),
      ipAddress: req.ip,
    });
    this.ok(res, "Video liked", data);
  });

  share = this.handle(async (req, res) => {
    const data = await videoService.share({
      videoId: this.paramId(req),
      platform: String(req.body.platform),
      userId: req.user?.id,
      ipAddress: req.ip,
    });
    this.ok(res, "Share tracked", data);
  });

  listComments = this.handle(async (req, res) => {
    const data = await videoService.listComments(this.paramId(req), {
      page: this.queryNumber(req, "page", 1),
      limit: this.queryNumber(req, "limit", 20),
    });
    this.ok(res, "Comments fetched", data);
  });

  addComment = this.handle(async (req, res) => {
    const data = await videoService.addComment({
      videoId: this.paramId(req),
      userId: req.user!.id,
      body: String(req.body.body),
    });
    this.created(res, "Comment added", data);
  });
}

export const videoController = new VideoController();
