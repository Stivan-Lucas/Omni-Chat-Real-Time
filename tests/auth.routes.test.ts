// src/tests/auth.routes.test.ts
import supertest from 'supertest'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { app } from '../src/app'
import { prisma } from '../src/lib/prisma'

const request = supertest(app.server)

describe('Auth Routes', () => {
  const testUser = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
  }

  let refreshToken: string

  beforeAll(async () => {
    // Limpa usuário de teste antes de rodar os testes
    await prisma.refreshToken.deleteMany({})
    await prisma.user.deleteMany({ where: { email: testUser.email } })
  })

  afterAll(async () => {
    // Limpa dados após os testes
    await prisma.refreshToken.deleteMany({})
    await prisma.user.deleteMany({ where: { email: testUser.email } })
    await prisma.$disconnect()
  })

  // -----------------------------
  // Register
  // -----------------------------
  it('should register a new user', async () => {
    const res = await request.post('/auth/register').send(testUser)
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.name).toBe(testUser.name)
    expect(res.body.email).toBe(testUser.email)
  })

  it('should not allow duplicate email registration', async () => {
    const res = await request.post('/auth/register').send(testUser)
    expect(res.status).toBe(409)
    expect(res.body).toHaveProperty('message')
  })

  // -----------------------------
  // Login
  // -----------------------------
  it('should login with correct credentials', async () => {
    const res = await request.post('/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accessToken')
    expect(res.body).toHaveProperty('refreshToken')
    refreshToken = res.body.refreshToken
  })

  it('should fail login with wrong password', async () => {
    const res = await request.post('/auth/login').send({
      email: testUser.email,
      password: 'wrongpassword',
    })
    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('message')
  })

  it('should fail login with non-existent email', async () => {
    const res = await request.post('/auth/login').send({
      email: 'notfound@example.com',
      password: 'password123',
    })
    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('message')
  })

  // -----------------------------
  // Refresh Token
  // -----------------------------
  it('should refresh tokens with valid refresh token', async () => {
    const res = await request.post('/auth/refresh').send({ refreshToken })
    console.debug('res status:', res.status)
    console.debug('res body:', res.body)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accessToken')
    expect(res.body).toHaveProperty('refreshToken')
    refreshToken = res.body.refreshToken
  })

  it('should fail refresh with invalid token', async () => {
    const res = await request
      .post('/auth/refresh')
      .send({ refreshToken: 'invalidtoken' })
    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('message')
  })

  it('should fail refresh with revoked token', async () => {
    // Primeiro revoga o token
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    })
    const res = await request.post('/auth/refresh').send({ refreshToken })
    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('message')
  })
})
