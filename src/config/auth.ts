// src/config/auth.ts
import { env } from './environment.ts'

export const authConfig = {
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  refreshSecret: env.REFRESH_SECRET,
  refreshExpiresIn: env.REFRESH_EXPIRES_IN,
}

if (!authConfig.jwtSecret || !authConfig.refreshSecret) {
  throw new Error(
    'JWT secrets are missing. Set JWT_SECRET and REFRESH_SECRET in your .env',
  )
}
