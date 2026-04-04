import env from "../config/environment.config";
import jwt, { type SignOptions } from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

function generateAccessToken(userId: string) {
  return jwt.sign(
    { userId, type: "access" },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] }
  );
}

function generateRefreshToken(userId: string) {
  return jwt.sign(
    { userId, type: "refresh" },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"] }
  );
}

function validateAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

function validateRefreshToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export default {
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
  validateRefreshToken
};