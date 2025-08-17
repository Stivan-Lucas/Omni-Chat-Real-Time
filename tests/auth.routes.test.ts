// src/tests/auth.routes.test.ts
import supertest from 'supertest'
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
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
    await prisma.refreshToken.deleteMany({})
    await prisma.user.deleteMany({ where: { email: testUser.email } })
  })

  afterAll(async () => {
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
    expect(res.body.email).toBe(testUser.email)
  })

  it('should not allow duplicate email registration', async () => {
    const res = await request.post('/auth/register').send(testUser)
    expect(res.status).toBe(409)
    expect(res.body).toHaveProperty('message')
  })

  it('should fail with invalid body (400)', async () => {
    const res = await request.post('/auth/register').send({
      name: 'ab',
      email: 'invalid',
      password: '123',
    })
    expect(res.status).toBe(400)
  })

  it('should handle unexpected error (500)', async () => {
    const spy = vi
      .spyOn(prisma.user, 'findUnique')
      .mockRejectedValueOnce(new Error('db error'))
    const res = await request.post('/auth/register').send({
      name: 'Another User',
      email: 'another@example.com',
      password: 'password123',
    })
    expect(res.status).toBe(500)
    spy.mockRestore()
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
  })

  it('should fail login with non-existent email', async () => {
    const res = await request.post('/auth/login').send({
      email: 'notfound@example.com',
      password: 'password123',
    })
    expect(res.status).toBe(401)
  })

  it('should fail login with invalid body (400)', async () => {
    const res = await request.post('/auth/login').send({
      email: 'not-an-email',
      password: '123',
    })
    expect(res.status).toBe(400)
  })

  it('should handle unexpected error (500)', async () => {
    const spy = vi
      .spyOn(prisma.user, 'findFirst')
      .mockRejectedValueOnce(new Error('db error'))
    const res = await request.post('/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    })
    expect(res.status).toBe(500)
    spy.mockRestore()
  })

  // -----------------------------
  // Refresh Token
  // -----------------------------
  it('should refresh tokens with valid refresh token', async () => {
    const res = await request.post('/auth/refresh').send({ refreshToken })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accessToken')
    expect(res.body).toHaveProperty('refreshToken')
    refreshToken = res.body.refreshToken
  })

  it('should fail refresh with invalid token (401)', async () => {
    const res = await request
      .post('/auth/refresh')
      .send({ refreshToken: 'invalidtoken' })
    expect(res.status).toBe(401)
  })

  it('should fail refresh with revoked token (401)', async () => {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    })
    const res = await request.post('/auth/refresh').send({ refreshToken })
    expect(res.status).toBe(401)
  })

  it('should fail refresh with invalid body (400)', async () => {
    const res = await request.post('/auth/refresh').send({})
    expect(res.status).toBe(400)
  })

  it('should handle unexpected error (500)', async () => {
    const spy = vi
      .spyOn(prisma.refreshToken, 'findFirst')
      .mockRejectedValueOnce(new Error('db error'))
    const res = await request.post('/auth/refresh').send({ refreshToken })
    expect(res.status).toBe(500)
    spy.mockRestore()
  })
})
