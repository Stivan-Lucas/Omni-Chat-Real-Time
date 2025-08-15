// ./tests/swagger.test.ts
import Fastify from 'fastify'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import SwaggerPlugin from '../src/lib/swagger'

let app: ReturnType<typeof Fastify>

describe('Swagger Plugin', () => {
  beforeAll(async () => {
    app = Fastify()
    await app.register(SwaggerPlugin)
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should return OpenAPI JSON at /openapi.json', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/openapi.json',
    })

    expect(response.statusCode).toBe(200)

    const body = response.json()
    expect(body).toHaveProperty('openapi')
    expect(body).toHaveProperty('info')
    expect(body.info).toHaveProperty('title')
    expect(body.info.title).toBeDefined()
    expect(body.info.version).toBeDefined()
    expect(body.info.description).toBeDefined()
  })
})
