// src/routes/users.routes.ts
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.ts'
import { verifyAccessToken, hashPassword } from '../utils/auth.ts'
import type { JwtPayload } from '../types/auth.ts'
import type { Prisma } from '@prisma/client'

function authGuard(req: FastifyRequest) {
  const auth = req.headers.authorization
  if (!auth) throw new Error('Missing Authorization header')
  const token = auth.replace(/^Bearer\s+/i, '')
  return verifyAccessToken(token)
}

export default async function UsersRoutes(app: FastifyInstance) {
  // Update user (requires JWT in header)
  app.patch(
    '/users/:id',
    {
      schema: {
        tags: ['users'],
        security: [{ bearerAuth: [] }],
        params: z.object({ id: z.string() }),
        body: z.object({
          name: z.string().min(1).optional(),
          email: z.email().optional(),
          password: z.string().min(6).optional(),
        }),
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            email: z.email(),
            updatedAt: z.string(),
          }),
          401: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (req, reply) => {
      let payload
      try {
        payload = authGuard(req)
      } catch {
        return reply.status(401).send({ message: 'Unauthorized' })
      }
      const { id } = req.params as { id: string }
      if (payload.id !== id) {
        return reply
          .status(401)
          .send({ message: 'You can only update your own account' })
      }
      const body = req.body as {
        name?: string
        email?: string
        password?: string
      }
      const data: Prisma.UserUpdateInput = {}
      if (body.name) data.name = body.name
      if (body.email) data.email = body.email
      if (body.password) data.password = await hashPassword(body.password)

      const updated = await prisma.user
        .update({
          where: { id, deletedAt: null },
          data,
        })
        .catch(() => null)

      if (!updated) return reply.status(404).send({ message: 'User not found' })

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
        tags: ['users'],
        description: 'Deleta um usuário pelo ID',
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().nonempty(),
        }),
      },
      preHandler: async (req, reply) => {
        try {
          // Pega o token do header Authorization
          const authHeader = req.headers['authorization']
          if (!authHeader)
            return reply.status(401).send({ message: 'Token ausente' })

          const token = authHeader.split(' ')[1] // Bearer <token>
          if (!token)
            return reply.status(401).send({ message: 'Token inválido' })

          req.user = verifyAccessToken(token) // sua função que decodifica JWT
        } catch {
          return reply
            .status(401)
            .send({ message: 'Token inválido ou expirado' })
        }
      },
    },
    async (req, reply) => {
      let payload: JwtPayload
      try {
        payload = authGuard(req)
      } catch {
        return reply.status(401).send({ message: 'Unauthorized' })
      }
      const { id } = req.params as { id: string }
      if (payload.id !== id) {
        return reply
          .status(401)
          .send({ message: 'You can only delete your own account' })
      }
      await prisma.user
        .update({
          where: { id },
          data: { deletedAt: new Date() },
        })
        .catch(() => {})
      return reply.status(204).send()
    },
  )
}
