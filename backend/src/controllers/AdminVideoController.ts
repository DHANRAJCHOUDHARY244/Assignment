import { videoService } from "../services/VideoService";
import { BaseController } from "./BaseController";

export class AdminVideoController extends BaseController {
  list = this.handle(async (req, res) => {
    const data = await videoService.list({
      page: this.queryNumber(req, "page", 1),
      limit: this.queryNumber(req, "limit", 40),
      includeInactive: true,
    });
    this.ok(res, "Admin videos fetched", data);
  });

  create = this.handle(async (req, res) => {
    const data = await videoService.create(req.body, true);
    this.created(res, "Video created", data);
  });

  update = this.handle(async (req, res) => {
    const data = await videoService.update(this.paramId(req), req.body, true);
    this.ok(res, "Video updated", data);
  });

  remove = this.handle(async (req, res) => {
    const data = await videoService.softDelete(this.paramId(req), true);
    this.ok(res, "Video deactivated", data);
  });
}

export const adminVideoController = new AdminVideoController();
