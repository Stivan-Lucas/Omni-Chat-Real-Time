// src/routes/users.routes.ts
import { z } from 'zod'
import type { FastifyRequest } from 'fastify'
import { prisma } from '../lib/prisma.ts'
import { verifyAccessToken, hashPassword } from '../utils/auth.ts'
import type { JwtPayload } from '../types/auth.ts'
import type { Prisma } from '@prisma/client'
import type { FastifyTypedInstance } from '../types/zod.ts'
import { Texts } from '../constants/texts.ts'

function authGuard(req: FastifyRequest) {
  const auth = req.headers.authorization
  if (!auth) throw new Error(Texts.userRoutes.errors.missingToken)
  const token = auth.replace(/^Bearer\s+/i, '')
  return verifyAccessToken(token)
}

export default async function UsersRoutes(app: FastifyTypedInstance) {
  // Update user
  app.patch(
    '/users/:id',
    {
      schema: {
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string() }),
        body: z.object({
          name: z.string().min(1).optional(),
          email: z.string().email().optional(),
          password: z.string().min(6).optional(),
        }),
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string().email(),
            updatedAt: z.string(),
          }),
          401: z.object({ message: z.string() }),
          403: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (req, reply) => {
      let payload
      try {
        payload = authGuard(req)
      } catch {
        return reply
          .status(401)
          .send({ message: Texts.userRoutes.errors.unauthorized })
      }

      const { id } = req.params as { id: string }
      if (payload.id !== id) {
        return reply
          .status(403)
          .send({ message: Texts.userRoutes.errors.forbiddenUpdate })
      }

      const { email, name, password } = req.body
      const data: Prisma.UserUpdateInput = {}
      if (name) data.name = name
      if (email) data.email = email
      if (password) data.password = await hashPassword(password)

      const updated = await prisma.user
        .update({
          where: { id, deletedAt: null },
          data,
        })
        .catch(() => null)

      if (!updated) {
        return reply
          .status(404)
          .send({ message: Texts.userRoutes.errors.notFound })
      }

      return reply.send({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        updatedAt: updated.updatedAt.toISOString(),
      })
    },
  )

  // Soft delete user
  app.delete(
    '/users/:id',
    {
      schema: {
        tags: ['Users'],
        description: 'Deleta um usuário pelo ID',
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().nonempty(),
        }),
        response: {
          401: z.object({ message: z.string() }),
          403: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          204: z.null(),
        },
      },
      preHandler: async (req, reply) => {
        try {
          const authHeader = req.headers['authorization']
          if (!authHeader) {
            return reply
              .status(401)
              .send({ message: Texts.userRoutes.errors.missingToken })
          }

          const token = authHeader.split(' ')[1]
          if (!token) {
            return reply
              .status(401)
              .send({ message: Texts.userRoutes.errors.invalidToken })
          }

          req.user = verifyAccessToken(token)
        } catch {
          return reply
            .status(401)
            .send({ message: Texts.userRoutes.errors.expiredToken })
        }
      },
    },
    async (req, reply) => {
      let payload: JwtPayload
      try {
        payload = authGuard(req)
      } catch {
        return reply
          .status(401)
          .send({ message: Texts.userRoutes.errors.unauthorized })
      }

      const { id } = req.params

      if (payload.id !== id) {
        return reply
          .status(403)
          .send({ message: Texts.userRoutes.errors.forbiddenDelete })
      }

      const deleted = await prisma.user
        .update({
          where: { id, deletedAt: null },
          data: { deletedAt: new Date() },
        })
        .catch(() => null)

      if (!deleted) {
        return reply
          .status(404)
          .send({ message: Texts.userRoutes.errors.notFound })
      }

      return reply.status(204).send()
    },
  )
}
