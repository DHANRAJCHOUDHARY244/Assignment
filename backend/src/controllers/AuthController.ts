import type { Request } from "express";

import { authService } from "../services/AuthService";
import { User, toPublicUser } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { BaseController } from "./BaseController";

export class AuthController extends BaseController {
  private metaFromRequest(req: Request) {
    return {
      userAgent: req.get("user-agent") ?? undefined,
      ipAddress: req.ip,
    };
  }

  signup = this.handle(async (req, res) => {
    const result = await authService.signup(
      req.body,
      this.metaFromRequest(req),
    );
    authService.setRefreshCookie(
      res,
      result.refreshToken,
      result.rememberMe,
    );
    this.created(res, "Signup successful", {
      user: result.user,
      accessToken: result.accessToken,
    });
  });

  login = this.handle(async (req, res) => {
    const result = await authService.login(req.body, {
      ...this.metaFromRequest(req),
      rememberMe: req.body.rememberMe === true,
    });
    authService.setRefreshCookie(
      res,
      result.refreshToken,
      result.rememberMe,
    );
    this.ok(res, "Login successful", {
      user: result.user,
      accessToken: result.accessToken,
    });
  });

  refresh = this.handle(async (req, res) => {
    const cookieName = authService.getRefreshCookieName();
    const raw =
      (req.cookies?.[cookieName] as string | undefined) ??
      (req.body?.refreshToken as string | undefined);

    const result = await authService.refresh(
      raw ?? "",
      this.metaFromRequest(req),
    );
    authService.setRefreshCookie(
      res,
      result.refreshToken,
      result.rememberMe,
    );
    this.ok(res, "Token refreshed", {
      user: result.user,
      accessToken: result.accessToken,
    });
  });

  logout = this.handle(async (req, res) => {
    const cookieName = authService.getRefreshCookieName();
    const raw = req.cookies?.[cookieName] as string | undefined;
    await authService.logout(raw);
    authService.clearRefreshCookie(res);
    this.ok(res, "Logged out");
  });

  me = this.handle(async (req, res) => {
    const user = await User.findById(req.user!.id);
    if (!user) throw ApiError.notFound("User not found");
    this.ok(res, "OK", { user: toPublicUser(user) });
  });
}

export const authController = new AuthController();
