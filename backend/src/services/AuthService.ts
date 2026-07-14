import crypto from "node:crypto";

import bcrypt from "bcryptjs";
import type { SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import type { CookieOptions, Response } from "express";

import { config } from "../config/app";
import { HTTP_STATUS } from "../constants/httpStatus";
import { RefreshToken, isRefreshTokenActive } from "../models/RefreshToken";
import { User, toPublicUser, isUserActive, type UserDocument } from "../models/User";
import type { AuthUserPayload } from "../types/express";
import type { UserRole } from "../constants/roles";
import { BaseService } from "./BaseService";

type TokenPairMeta = {
  rememberMe?: boolean;
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
};

type AuthResult = {
  user: ReturnType<typeof toPublicUser>;
  accessToken: string;
  refreshToken: string;
  rememberMe: boolean;
};

const REFRESH_COOKIE = "refreshToken";
const REMEMBER_REFRESH_DAYS = 30;

export class AuthService extends BaseService {
  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.security.bcryptRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private signAccessToken(user: UserDocument): string {
    const payload: AuthUserPayload = {
      id: String(user._id),
      email: user.email,
      role: user.role as UserRole,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as SignOptions);
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  private getRefreshExpiry(rememberMe: boolean): Date {
    const days = rememberMe
      ? REMEMBER_REFRESH_DAYS
      : this.parseDurationDays(config.jwt.refreshExpiresIn);
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  private parseDurationDays(value: string): number {
    const match = /^(\d+)\s*([dhms])$/i.exec(value.trim());
    if (!match) return 15;
    const amount = Number(match[1]);
    const unit = match[2]!.toLowerCase();
    if (unit === "d") return amount;
    if (unit === "h") return amount / 24;
    if (unit === "m") return amount / (24 * 60);
    return amount / (24 * 60 * 60);
  }

  private cookieOptions(rememberMe: boolean): CookieOptions {
    return {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax",
      path: "/api/auth",
      maxAge: this.getRefreshExpiry(rememberMe).getTime() - Date.now(),
    };
  }

  setRefreshCookie(
    res: Response,
    refreshToken: string,
    rememberMe: boolean,
  ): void {
    res.cookie(REFRESH_COOKIE, refreshToken, this.cookieOptions(rememberMe));
  }

  clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: "lax",
      path: "/api/auth",
    });
  }

  getRefreshCookieName(): string {
    return REFRESH_COOKIE;
  }

  private async issueRefreshToken(
    user: UserDocument,
    meta: TokenPairMeta,
  ): Promise<string> {
    const rememberMe = meta.rememberMe === true;
    const raw = crypto.randomBytes(48).toString("hex");
    const tokenHash = this.hashToken(raw);

    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: this.getRefreshExpiry(rememberMe),
      rememberMe,
      userAgent: meta.userAgent ?? null,
      ipAddress: meta.ipAddress ?? null,
    });

    return raw;
  }

  private async buildAuthResult(
    user: UserDocument,
    meta: TokenPairMeta,
  ): Promise<AuthResult> {
    const rememberMe = meta.rememberMe === true;
    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user, {
      ...meta,
      rememberMe,
    });
    return {
      user: toPublicUser(user),
      accessToken,
      refreshToken,
      rememberMe,
    };
  }

  async signup(
    input: { fullName: string; email: string; password: string },
    meta: TokenPairMeta,
  ): Promise<AuthResult> {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      this.fail("Email already registered", HTTP_STATUS.CONFLICT);
    }

    const password = await this.hashPassword(input.password);
    const user = await User.create({
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      password,
      role: "user",
    });

    return this.buildAuthResult(user, meta);
  }

  async login(
    input: { email: string; password: string; rememberMe?: boolean },
    meta: TokenPairMeta,
  ): Promise<AuthResult> {
    const user = await User.findOne({ email: input.email.toLowerCase() }).select(
      "+password",
    );

    if (!user?.password) {
      this.fail("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
    }

    const valid = await this.comparePassword(input.password, user.password);
    if (!valid) {
      this.fail("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
    }

    if (!isUserActive(user)) {
      this.fail("Account is blocked. Contact support.", HTTP_STATUS.FORBIDDEN);
    }

    return this.buildAuthResult(user, {
      ...meta,
      rememberMe: input.rememberMe === true,
    });
  }

  async refresh(
    rawToken: string,
    meta: TokenPairMeta,
  ): Promise<AuthResult> {
    const tokenHash = this.hashToken(rawToken);
    const stored = await RefreshToken.findOne({ tokenHash });

    if (!stored || !isRefreshTokenActive(stored)) {
      this.fail("Invalid or expired refresh token", HTTP_STATUS.UNAUTHORIZED);
    }

    stored.revokedAt = new Date();
    await stored.save();

    const user = await User.findById(stored.userId);
    if (!user) {
      this.fail("User not found", HTTP_STATUS.UNAUTHORIZED);
    }

    if (!isUserActive(user)) {
      this.fail("Account is blocked. Contact support.", HTTP_STATUS.FORBIDDEN);
    }

    return this.buildAuthResult(user, {
      ...meta,
      rememberMe: stored.rememberMe === true,
    });
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const tokenHash = this.hashToken(rawToken);
    await RefreshToken.updateOne(
      { tokenHash, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }

  verifyAccessToken(token: string): AuthUserPayload {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as AuthUserPayload;
      if (!payload.id || !payload.email || !payload.role) {
        this.fail("Invalid access token", HTTP_STATUS.UNAUTHORIZED);
      }
      return payload;
    } catch {
      this.fail("Invalid or expired access token", HTTP_STATUS.UNAUTHORIZED);
    }
  }

  async ensureDefaultAdmin(): Promise<"created" | "promoted" | "exists"> {
    const adminExists = await User.exists({ role: "admin" });
    if (adminExists) {
      return "exists";
    }

    const email = config.admin.email;
    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = "admin";
      existing.status = "active";
      await existing.save();
      return "promoted";
    }

    await User.create({
      fullName: config.admin.fullName,
      email,
      password: await this.hashPassword(config.admin.password),
      role: "admin",
      status: "active",
    });

    return "created";
  }
}

export const authService = new AuthService();
