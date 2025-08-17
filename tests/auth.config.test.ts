// test/utils/auth.config.test.ts
import { describe, it, expect } from 'vitest'
import {
  toJwtExpiresIn,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
} from '../src/utils/auth'

describe('Auth Utils', () => {
  const payload = { id: '1', name: 'Tester', email: 't@example.com' }

  it('should convert expiresIn string to seconds', () => {
    expect(toJwtExpiresIn('7d')).toBe(604800)
    expect(toJwtExpiresIn('2h')).toBe(7200)
    expect(toJwtExpiresIn('15m')).toBe(900)
    expect(toJwtExpiresIn('30s')).toBe(30)
    expect(toJwtExpiresIn('')).toBe(604800)
  })

  it('should sign and verify access token', () => {
    const token = signAccessToken(payload)
    const decoded = verifyAccessToken(token)
    expect(decoded.id).toBe(payload.id)
    expect(decoded.email).toBe(payload.email)
  })

  it('should sign and verify refresh token', () => {
    const token = signRefreshToken(payload)
    const decoded = verifyRefreshToken(token)
    expect(decoded.id).toBe(payload.id)
  })

  it('should throw on invalid access token', () => {
    expect(() => verifyAccessToken('invalid')).toThrow()
  })

  it('should throw on invalid refresh token', () => {
    expect(() => verifyRefreshToken('invalid')).toThrow()
  })

  it('should hash and compare password correctly', async () => {
    const plain = 'password123'
    const hash = await hashPassword(plain)
    expect(hash).not.toBe(plain)

    const isMatch = await comparePassword(plain, hash)
    expect(isMatch).toBe(true)

    const isNotMatch = await comparePassword('wrong', hash)
    expect(isNotMatch).toBe(false)
  })
})
