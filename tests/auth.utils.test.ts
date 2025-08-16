// test/auth.utils.test.ts
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  toJwtExpiresIn,
} from '../src/utils/auth'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { env } from '../src/config/environment'
import type { JwtPayload } from '../src/types/auth'

// Mock dos módulos externos com tipagem completa
vi.mock('jsonwebtoken')
vi.mock('bcryptjs')

// Tipos para os mocks
type MockedJwt = {
  sign: Mock
  verify: Mock
}

type MockedBcrypt = {
  genSalt: Mock
  hash: Mock
  compare: Mock
}

describe('Auth Utilities', () => {
  const mockPayload: JwtPayload = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
  }

  const mockToken = 'mock.token.123'
  const mockHashedPassword = '$2a$10$hashedpassword123'
  const mockPlainPassword = 'password123'
  const mockSalt = '$2a$10$salt123'

  // Cast dos mocks com tipagem correta
  const mockedJwt = jwt as unknown as MockedJwt
  const mockedBcrypt = bcrypt as unknown as MockedBcrypt

  beforeEach(() => {
    vi.clearAllMocks()

    // Configuração padrão dos mocks
    mockedJwt.sign.mockReturnValue(mockToken)
    mockedJwt.verify.mockReturnValue({
      ...mockPayload,
      exp: 1234567890,
      iat: 1234567800,
    })
    mockedBcrypt.genSalt.mockResolvedValue(mockSalt)
    mockedBcrypt.hash.mockResolvedValue(mockHashedPassword)
    mockedBcrypt.compare.mockResolvedValue(true)
  })

  describe('toJwtExpiresIn()', () => {
    it('should convert days to seconds correctly', () => {
      expect(toJwtExpiresIn('1d')).toBe(86400)
      expect(toJwtExpiresIn('7d')).toBe(604800)
    })

    it('should convert hours to seconds correctly', () => {
      expect(toJwtExpiresIn('1h')).toBe(3600)
      expect(toJwtExpiresIn('24h')).toBe(86400)
    })

    it('should convert minutes to seconds correctly', () => {
      expect(toJwtExpiresIn('1m')).toBe(60)
      expect(toJwtExpiresIn('60m')).toBe(3600)
    })

    it('should accept seconds directly', () => {
      expect(toJwtExpiresIn('3600s')).toBe(3600)
      expect(toJwtExpiresIn('1s')).toBe(1)
    })

    it('should use default value (7d) when format is invalid', () => {
      expect(toJwtExpiresIn('invalid')).toBe(604800)
      expect(toJwtExpiresIn('')).toBe(604800)
      expect(toJwtExpiresIn('123')).toBe(604800)
    })

    it('should use fallback value (7) when number is invalid', () => {
      expect(toJwtExpiresIn('d')).toBe(604800) // 7d
      expect(toJwtExpiresIn('xd')).toBe(604800) // 7d
    })
  })

  describe('signAccessToken()', () => {
    it('should sign token with correct payload and options', () => {
      const result = signAccessToken(mockPayload)

      expect(mockedJwt.sign).toHaveBeenCalledWith(mockPayload, env.JWT_SECRET, {
        expiresIn: toJwtExpiresIn(env.JWT_EXPIRES_IN),
      })
      expect(result).toBe(mockToken)
    })

    it('should include JWT payload fields in the signed token', () => {
      signAccessToken(mockPayload)

      const signedPayload = mockedJwt.sign.mock.calls[0][0] as JwtPayload
      expect(signedPayload.id).toBe(mockPayload.id)
      expect(signedPayload.name).toBe(mockPayload.name)
      expect(signedPayload.email).toBe(mockPayload.email)
    })
  })

  describe('signRefreshToken()', () => {
    it('should sign refresh token with correct payload and options', () => {
      const result = signRefreshToken(mockPayload)

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        mockPayload,
        env.REFRESH_SECRET,
        {
          expiresIn: toJwtExpiresIn(env.REFRESH_EXPIRES_IN),
        },
      )
      expect(result).toBe(mockToken)
    })

    it('should use different secret than access token', () => {
      signRefreshToken(mockPayload)
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        expect.anything(),
        env.REFRESH_SECRET,
        expect.anything(),
      )
    })
  })

  describe('verifyAccessToken()', () => {
    it('should verify token with correct secret', () => {
      const result = verifyAccessToken(mockToken)

      expect(mockedJwt.verify).toHaveBeenCalledWith(mockToken, env.JWT_SECRET)
      expect(result).toEqual({
        ...mockPayload,
        exp: 1234567890,
        iat: 1234567800,
      })
    })

    it('should throw when verification fails', () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      expect(() => verifyAccessToken(mockToken)).toThrow('Invalid token')
    })

    it('should return payload with correct JwtPayload type', () => {
      const result = verifyAccessToken(mockToken)
      expect(result).toMatchObject<JwtPayload>({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
        exp: expect.any(Number),
        iat: expect.any(Number),
      })
    })
  })

  describe('verifyRefreshToken()', () => {
    it('should verify token with correct secret', () => {
      const result = verifyRefreshToken(mockToken)

      expect(mockedJwt.verify).toHaveBeenCalledWith(
        mockToken,
        env.REFRESH_SECRET,
      )
      expect(result).toEqual({
        ...mockPayload,
        exp: 1234567890,
        iat: 1234567800,
      })
    })

    it('should throw when verification fails', () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid refresh token')
      })

      expect(() => verifyRefreshToken(mockToken)).toThrow(
        'Invalid refresh token',
      )
    })
  })

  describe('hashPassword()', () => {
    it('should generate salt and hash password', async () => {
      const result = await hashPassword(mockPlainPassword)

      expect(mockedBcrypt.genSalt).toHaveBeenCalledWith(10)
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        mockPlainPassword,
        mockSalt,
      )
      expect(result).toBe(mockHashedPassword)
    })

    it('should throw when hashing fails', async () => {
      mockedBcrypt.genSalt.mockRejectedValue(new Error('Hashing error'))

      await expect(hashPassword(mockPlainPassword)).rejects.toThrow(
        'Hashing error',
      )
    })
  })

  describe('comparePassword()', () => {
    it('should compare plain password with hash', async () => {
      const result = await comparePassword(
        mockPlainPassword,
        mockHashedPassword,
      )

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        mockPlainPassword,
        mockHashedPassword,
      )
      expect(result).toBe(true)
    })

    it('should return false when passwords dont match', async () => {
      mockedBcrypt.compare.mockResolvedValue(false)

      const result = await comparePassword('wrong', mockHashedPassword)
      expect(result).toBe(false)
    })

    it('should throw when comparison fails', async () => {
      mockedBcrypt.compare.mockRejectedValue(new Error('Comparison error'))

      await expect(
        comparePassword(mockPlainPassword, mockHashedPassword),
      ).rejects.toThrow('Comparison error')
    })
  })
})
