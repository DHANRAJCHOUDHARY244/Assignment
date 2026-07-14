import { adminUserService } from "../services/AdminUserService";
import { BaseController } from "./BaseController";

export class AdminUserController extends BaseController {
  list = this.handle(async (req, res) => {
    const data = await adminUserService.list({
      page: this.queryNumber(req, "page", 1),
      limit: this.queryNumber(req, "limit", 12),
    });
    this.ok(res, "Admin users fetched", data);
  });

  getById = this.handle(async (req, res) => {
    const data = await adminUserService.getById(this.paramId(req));
    this.ok(res, "Admin user detail fetched", data);
  });

  updateStatus = this.handle(async (req, res) => {
    const data = await adminUserService.updateStatus(
      this.paramId(req),
      req.body.status,
      req.user!.id,
    );
    this.ok(res, "User status updated", data);
  });
}

export const adminUserController = new AdminUserController();
