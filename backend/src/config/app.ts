import dotenvx from "@dotenvx/dotenvx";
import { cleanEnv, str, num, bool, port, url, email } from "envalid";

import { DEFAULT_ADMIN } from "../constants/admin";
import type { AppConfigShape } from "../types/config";

dotenvx.config({ ignore: ["MISSING_ENV_FILE"] });

export class AppConfig implements AppConfigShape {
  readonly port: number;
  readonly nodeEnv: string;
  readonly logLevel: string;
  readonly app: AppConfigShape["app"];
  readonly databaseUrl: string;
  readonly cors: string[];
  readonly jwt: AppConfigShape["jwt"];
  readonly email: AppConfigShape["email"];
  readonly security: AppConfigShape["security"];
  readonly admin: AppConfigShape["admin"];

  constructor() {
    const env = cleanEnv(process.env, {
      PORT: port({ default: 5050, desc: "Port number for the Express server" }),
      NODE_ENV: str({
        default: "development",
        desc: "Node environment (development, production, etc.)",
      }),
      LOG_LEVEL: str({
        default: "info",
        desc: "Logging level (error, warn, info, debug)",
      }),
      APP_NAME: str({ desc: "Application name" }),
      BASE_URL: url({ desc: "Base URL for the application" }),
      DATABASE_URL: str({ desc: "MongoDB connection URI for Mongoose" }),
      CORS_ORIGINS: str({ desc: "list of allowed CORS origins" }),
      JWT_SECRET: str({ desc: "Secret key for JWT token signing" }),
      JWT_REFRESH_SECRET: str({
        desc: "Secret key for JWT refresh token signing",
      }),
      JWT_EXPIRES_IN: str({ default: "15M", desc: "JWT token expiration time" }),
      JWT_REFRESH_EXPIRES_IN: str({
        default: "15D",
        desc: "JWT refresh token expiration time",
      }),
      EMAIL_HOST: str({ desc: "SMTP email server host" }),
      EMAIL_PORT: port({ default: 587, desc: "SMTP email server port" }),
      EMAIL_SECURE: bool({
        default: false,
        desc: "Whether to use secure email connection (true/false)",
      }),
      EMAIL_USER: str({ desc: "SMTP email username" }),
      EMAIL_PASSWORD: str({ desc: "SMTP email password" }),
      EMAIL_FROM: email({ desc: "Default sender email address" }),
      BCRYPT_ROUNDS: num({
        default: 12,
        desc: "Number of bcrypt hashing rounds",
      }),
      MAX_LOGIN_ATTEMPTS: num({
        default: 5,
        desc: "Maximum number of login attempts before account lockout",
      }),
      LOCK_TIME: num({ default: 30, desc: "Account lockout time in minutes" }),
      ADMIN_EMAIL: str({
        default: DEFAULT_ADMIN.EMAIL,
        desc: "Default admin email (used only when no admin exists)",
      }),
      ADMIN_PASSWORD: str({
        default: DEFAULT_ADMIN.PASSWORD,
        desc: "Default admin password (used only when no admin exists)",
      }),
      ADMIN_FULL_NAME: str({
        default: DEFAULT_ADMIN.FULL_NAME,
        desc: "Default admin display name",
      }),
    });

    this.port = env.PORT;
    this.nodeEnv = env.NODE_ENV;
    this.logLevel = env.LOG_LEVEL;
    this.app = {
      name: env.APP_NAME,
      url: `${env.BASE_URL}:${env.PORT}`,
    };
    this.databaseUrl = env.DATABASE_URL;
    this.cors = env.CORS_ORIGINS.split(",").map((origin) => origin.trim());
    this.jwt = {
      secret: env.JWT_SECRET,
      refreshSecret: env.JWT_REFRESH_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    };
    this.email = {
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_SECURE,
      user: env.EMAIL_USER,
      password: env.EMAIL_PASSWORD,
      from: env.EMAIL_FROM,
    };
    this.security = {
      bcryptRounds: env.BCRYPT_ROUNDS,
      maxLoginAttempts: env.MAX_LOGIN_ATTEMPTS,
      lockTime: env.LOCK_TIME,
    };
    this.admin = {
      email: env.ADMIN_EMAIL.toLowerCase(),
      password: env.ADMIN_PASSWORD,
      fullName: env.ADMIN_FULL_NAME,
    };
  }
}

export const config = new AppConfig();
