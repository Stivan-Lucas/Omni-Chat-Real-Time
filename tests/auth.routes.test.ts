// src/tests/auth.routes.test.ts
import { z } from 'zod'
import supertest from 'supertest'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { buildServer } from '../src/lib/buildServer' // ajuste se tiver um server export
import { prisma } from '../src/lib/prisma'

let app: ReturnType<typeof buildServer>
let request: ReturnType<typeof supertest>

beforeAll(async () => {
  app = buildServer()
  await app.ready()
  request = supertest(app.server)
})

afterAll(async () => {
  await prisma.refreshToken.deleteMany()
  await prisma.user.deleteMany()
  await app.close()
})

describe('Auth Routes', () => {
  let refreshToken: string

  const registerSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    createdAt: z.string(),
  })

  const loginSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })

  it('should register a new user', async () => {
    const res = await request.post('/auth/register').send({
      name: 'Vitest User',
      email: 'vitest@example.com',
      password: 'password123',
    })

    expect(res.status).toBe(201)
    registerSchema.parse(res.body) // valida com Zod
  })

  it('should not register with the same email', async () => {
    const res = await request.post('/auth/register').send({
      name: 'Vitest User 2',
      email: 'vitest@example.com',
      password: 'password123',
    })

    expect(res.status).toBe(409)
    expect(res.body.message).toBeDefined()
  })

  it('should login the user', async () => {
    const res = await request.post('/auth/login').send({
      email: 'vitest@example.com',
      password: 'password123',
    })

    expect(res.status).toBe(200)
    const data = loginSchema.parse(res.body)
    refreshToken = data.refreshToken
  })

  it('should not login with wrong password', async () => {
    const res = await request.post('/auth/login').send({
      email: 'vitest@example.com',
      password: 'wrongpassword',
    })

    expect(res.status).toBe(401)
    expect(res.body.message).toBeDefined()
  })

  it('should refresh tokens', async () => {
    const res = await request.post('/auth/refresh').send({
      refreshToken,
    })

    expect(res.status).toBe(200)
    const data = loginSchema.parse(res.body)
    expect(data.accessToken).not.toBe(refreshToken)
    expect(data.refreshToken).not.toBe(refreshToken)
  })

  it('should fail to refresh with invalid token', async () => {
    const res = await request.post('/auth/refresh').send({
      refreshToken: 'invalidtoken',
    })

    expect(res.status).toBe(401)
    expect(res.body.message).toBeDefined()
  })
})
