export type AppSettings = {
  name: string;
  url: string;
};

export type JwtConfig = {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
};

export type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
};

export type SecurityConfig = {
  bcryptRounds: number;
  maxLoginAttempts: number;
  lockTime: number;
};

export type AdminConfig = {
  email: string;
  password: string;
  fullName: string;
};

export type AppConfigShape = {
  port: number;
  nodeEnv: string;
  logLevel: string;
  app: AppSettings;
  databaseUrl: string;
  cors: string[];
  jwt: JwtConfig;
  email: EmailConfig;
  security: SecurityConfig;
  admin: AdminConfig;
};
