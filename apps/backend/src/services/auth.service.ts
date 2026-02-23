import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { redis } from '../config/redis';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '@docudex/shared-types';

const SALT_ROUNDS = 12;
const OTP_TTL = 900; // 15 minutes

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const { email, phone, fullName, password } = data;

  // Check existing user
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw createError('Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = uuidv4();

  const result = await pool.query(
    `INSERT INTO users (id, email, phone, full_name, password_hash, role)
     VALUES ($1, $2, $3, $4, $5, 'user')
     RETURNING id, email, phone, full_name, role, is_email_verified, is_phone_verified, mfa_enabled, created_at, updated_at`,
    [id, email, phone || null, fullName, passwordHash]
  );

  const user = mapDbUser(result.rows[0]);
  const tokens = await generateTokens(user);

  return { user, tokens };
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const { email, password } = data;

  const result = await pool.query(
    `SELECT id, email, phone, full_name, role, password_hash,
            is_email_verified, is_phone_verified, mfa_enabled, created_at, updated_at
     FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw createError('Invalid credentials', 401);
  }

  const row = result.rows[0];
  const isValidPassword = await bcrypt.compare(password, row.password_hash);

  if (!isValidPassword) {
    throw createError('Invalid credentials', 401);
  }

  const user = mapDbUser(row);
  const tokens = await generateTokens(user);

  return { user, tokens };
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string }> {
  try {
    const payload = verifyToken(refreshToken);

    // Check blacklist
    const blacklisted = await redis.get(`blacklist:${refreshToken}`);
    if (blacklisted) throw createError('Token revoked', 401);

    const accessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return { accessToken };
  } catch {
    throw createError('Invalid or expired refresh token', 401);
  }
}

export async function logoutUser(refreshToken: string): Promise<void> {
  try {
    const payload = verifyToken(refreshToken);
    const ttl = (payload as unknown as { exp: number }).exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await redis.setex(`blacklist:${refreshToken}`, ttl, '1');
    }
  } catch {
    // Token already invalid, no-op
    logger.debug('Logout called with invalid token');
  }
}

export async function getUserById(userId: string): Promise<User> {
  const result = await pool.query(
    `SELECT id, email, phone, full_name, role, is_email_verified, is_phone_verified,
            mfa_enabled, created_at, updated_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw createError('User not found', 404);
  }

  return mapDbUser(result.rows[0]);
}

export async function generateEmailOtp(userId: string): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.setex(`otp:email:${userId}`, OTP_TTL, otp);
  return otp;
}

export async function verifyEmailOtp(userId: string, otp: string): Promise<void> {
  const stored = await redis.get(`otp:email:${userId}`);
  if (!stored || stored !== otp) {
    throw createError('Invalid or expired OTP', 400);
  }
  await redis.del(`otp:email:${userId}`);
  await pool.query('UPDATE users SET is_email_verified = true WHERE id = $1', [userId]);
}

// ─── Private helpers ─────────────────────────
async function generateTokens(user: User) {
  const payload = { userId: user.id, email: user.email, role: user.role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

function mapDbUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    phone: (row.phone as string) || undefined,
    fullName: row.full_name as string,
    role: row.role as 'user' | 'admin',
    isEmailVerified: row.is_email_verified as boolean,
    isPhoneVerified: row.is_phone_verified as boolean,
    mfaEnabled: row.mfa_enabled as boolean,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}
