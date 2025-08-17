// src/utils/auth.ts
import bcrypt from 'bcryptjs'
import jwt, { type SignOptions } from 'jsonwebtoken'
import type { JwtPayload } from '../types/auth.ts'
import { env } from '../config/environment.ts'

// Função utilitária para converter expiresIn em segundos (compatível com SignOptions)
export function toJwtExpiresIn(envValue: string): number {
  const unit = envValue.slice(-1) // Pega a unidade (d, h, m, s)
  const value = parseInt(envValue.slice(0, -1), 10) || 7 // Valor numérico (fallback: 7)

  switch (unit) {
    case 'd':
      return value * 86400 // Dias para segundos
    case 'h':
      return value * 3600 // Horas para segundos
    case 'm':
      return value * 60 // Minutos para segundos
    case 's':
      return value // Segundos
    default:
      return 604800 // Fallback padrão (7 dias)
  }
}

// Gera access token (7d)
export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: toJwtExpiresIn(env.JWT_EXPIRES_IN),
  }
  return jwt.sign(payload as object, env.JWT_SECRET, options)
}

// Gera refresh token (14d)
export function signRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: toJwtExpiresIn(env.REFRESH_EXPIRES_IN),
  }
  return jwt.sign(payload as object, env.REFRESH_SECRET, options)
}

// Verifica access token
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload
}

// Verifica refresh token
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.REFRESH_SECRET) as JwtPayload
}

// Hash de senha
export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plain, salt)
}

// Comparar senha
export async function comparePassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
