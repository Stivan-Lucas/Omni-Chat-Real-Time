// src/tests/auth.routes.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import supertest from 'supertest'
import { z } from 'zod'
import { buildFastify } from '../src/utils/test-server'
import { prisma } from '../src/lib/prisma'

let app: Awaited<ReturnType<typeof buildFastify>> // ✅ corrigido

beforeAll(async () => {
  app = await buildFastify() // ✅ agora await
  await app.ready()
})

afterAll(async () => {
  await app.close()
  // Limpa os usuários e tokens criados
  await prisma.refreshToken.deleteMany({})
  await prisma.user.deleteMany({})
})

describe('Auth Routes', () => {
  const registerBodySchema = z.object({
    name: z.string().min(4),
    email: z.email(),
    password: z.string().min(8),
  })

  const registerResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    createdAt: z.string(),
  })

  const loginBodySchema = z.object({
    email: z.email(),
    password: z.string().min(6),
  })

  const loginResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })

  const refreshBodySchema = z.object({
    refreshToken: z.string().min(10),
  })

  const refreshResponseSchema = loginResponseSchema // mesmo formato do login

  let userData = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'supersecurepassword',
  }

  let refreshToken: string

  it('should register a new user', async () => {
    // valida antes de enviar
    registerBodySchema.parse(userData)

    const res = await supertest(app.server)
      .post('/auth/register')
      .send(userData)
      .expect(201)

    const data = registerResponseSchema.parse(res.body)

    expect(data.name).toBe(userData.name)
    expect(data.email).toBe(userData.email)
    expect(new Date(data.createdAt).toString()).not.toBe('Invalid Date')
  })

  it('should login with registered user', async () => {
    const loginData = {
      email: userData.email,
      password: userData.password,
    }

    loginBodySchema.parse(loginData)

    const res = await supertest(app.server)
      .post('/auth/login')
      .send(loginData)
      .expect(200)

    const data = loginResponseSchema.parse(res.body)
    expect(data.accessToken).toBeTypeOf('string')
    expect(data.refreshToken).toBeTypeOf('string')

    refreshToken = data.refreshToken
  })

  it('should refresh tokens', async () => {
    const refreshData = { refreshToken }
    refreshBodySchema.parse(refreshData)

    const res = await supertest(app.server)
      .post('/auth/refresh')
      .send(refreshData)
      .expect(200)

    const data = refreshResponseSchema.parse(res.body)
    expect(data.accessToken).toBeTypeOf('string')
    expect(data.refreshToken).toBeTypeOf('string')
  })
})
