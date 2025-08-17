// src/routes/auth.routes.ts
import { z } from 'zod'
import { prisma } from '../lib/prisma.ts'
import {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/auth.ts'
import type { DecodedJwt, JwtPayload } from '../types/auth.ts'
import { Texts } from '../constants/texts.ts'
import type { FastifyTypedInstance } from '../types/zod.ts'

export default async function AuthRoutes(app: FastifyTypedInstance) {
  // -----------------------------
  // Register
  // -----------------------------
  app.post(
    '/auth/register',
    {
      schema: {
        tags: ['Auth'],
        body: z.object({
          name: z.string().min(4),
          email: z.email(),
          password: z.string().min(8),
        }),
        response: {
          201: z.object({
            id: z.string(),
            name: z.string(),
            email: z.email(),
            createdAt: z.string(),
          }),
          400: z.object({ message: z.string() }), // validação
          409: z.object({ message: z.string() }), // email já em uso
          500: z.object({ message: z.string() }), // erro inesperado
        },
      },
    },
    async (req, reply) => {
      try {
        const { name, email, password } = req.body

        // Verifica se o email já existe
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
          return reply
            .status(409)
            .send({ message: Texts.authRoute.register.errors.emailInUse })
        }

        const hashedPassword = await hashPassword(password)
        const user = await prisma.user.create({
          data: { name, email, password: hashedPassword },
        })

        return reply.status(201).send({
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        })
      } catch (err) {
        req.log.error(err)
        return reply.status(500).send({
          message: Texts.authRoute.register.errors.internalServerError,
        })
      }
    },
  )

  // -----------------------------
  // Login
  // -----------------------------
  app.post(
    '/auth/login',
    {
      schema: {
        tags: ['Auth'],
        body: z.object({
          email: z.email(),
          password: z.string().min(6),
        }),
        response: {
          200: z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
          }),
          400: z.object({ message: z.string() }), // validação
          401: z.object({ message: z.string() }), // credenciais inválidas
          500: z.object({ message: z.string() }), // erro inesperado
        },
      },
    },
    async (req, reply) => {
      try {
        const { email, password } = req.body

        const user = await prisma.user.findFirst({
          where: { email, deletedAt: null },
        })

        if (!user) {
          return reply
            .status(401)
            .send({ message: Texts.authRoute.login.errors.invalidCredentials })
        }

        const isValid = await comparePassword(password, user.password)
        if (!isValid) {
          return reply
            .status(401)
            .send({ message: Texts.authRoute.login.errors.invalidCredentials })
        }

        const payload: JwtPayload = {
          id: user.id,
          name: user.name,
          email: user.email,
        }

        const accessToken = signAccessToken(payload)
        const refreshToken = signRefreshToken(payload)

        // Salva refresh token no banco
        const decoded = verifyRefreshToken(refreshToken) as DecodedJwt
        await prisma.refreshToken.create({
          data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(decoded.exp * 1000),
          },
        })

        return reply.status(200).send({ accessToken, refreshToken })
      } catch (err) {
        req.log.error(err)
        return reply.status(500).send({
          message: Texts.authRoute.login.errors.internalServerError,
        })
      }
    },
  )

  // -----------------------------
  // Refresh Token
  // -----------------------------
  app.post(
    '/auth/refresh',
    {
      schema: {
        tags: ['Auth'],
        body: z.object({ refreshToken: z.string().min(10) }),
        response: {
          200: z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
          }),
          400: z.object({ message: z.string() }), // validação
          401: z.object({ message: z.string() }), // token inválido/expirado
          500: z.object({ message: z.string() }), // erro inesperado
        },
      },
    },
    async (req, reply) => {
      try {
        const { refreshToken } = req.body

        // 1. Verifica se o token existe e é válido
        const storedToken = await prisma.refreshToken.findFirst({
          where: {
            token: refreshToken,
            revokedAt: null,
            expiresAt: { gt: new Date() },
          },
        })

        if (
          !storedToken ||
          storedToken.revokedAt ||
          storedToken.expiresAt < new Date()
        ) {
          return reply.status(401).send({
            message: Texts.authRoute.refresh.errors.invalidRefreshToken,
          })
        }

        // 2. Verifica a assinatura do token
        let payload: JwtPayload
        try {
          payload = verifyRefreshToken(refreshToken)
        } catch {
          return reply.status(401).send({
            message: Texts.authRoute.refresh.errors.invalidRefreshToken,
          })
        }

        // 3. Remove campos temporais
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { exp, iat, ...cleanPayload } = payload

        // 4. Gera novos tokens
        const newAccessToken = signAccessToken(cleanPayload)
        const newRefreshToken = signRefreshToken(cleanPayload)
        const decodedNew = verifyRefreshToken(newRefreshToken) as DecodedJwt

        // 5. Atualiza o token existente
        await prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: {
            token: newRefreshToken,
            expiresAt: new Date(decodedNew.exp * 1000),
            revokedAt: null,
          },
        })

        return reply.status(200).send({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        })
      } catch (err) {
        req.log.error(err)
        return reply.status(500).send({
          message: Texts.authRoute.refresh.errors.internalServerError,
        })
      }
    },
  )
}
