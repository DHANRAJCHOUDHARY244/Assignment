import winston from "winston";
import { config } from "../config/app";

const { combine, colorize, timestamp, errors, printf } = winston.format;

export const logger = winston.createLogger({
  level: config.logLevel,
  defaultMeta: { service: config.app.name },
  format: combine(
    errors({ stack: true }),
    timestamp(),
    printf(({ timestamp, level, message, stack, ...meta }) => {
      const metaString = Object.keys(meta).length
        ? ` ${JSON.stringify(meta)}`
        : "";

      return stack
        ? `${timestamp} ${level}: ${message}\n${stack}${metaString}`
        : `${timestamp} ${level}: ${message}${metaString}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize({ all: true })),
    }),
  ],
});