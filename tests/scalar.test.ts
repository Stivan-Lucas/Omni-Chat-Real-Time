import Fastify from 'fastify'
import ScalarPlugin from '../src/lib/scalar'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'

describe('Scalar Plugin', () => {
  let app: ReturnType<typeof Fastify>

  beforeAll(async () => {
    app = Fastify()
    await app.register(ScalarPlugin)
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should redirect / to /docs', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
      followRedirects: false,
    })

    expect(response.statusCode).toBe(302)
    expect(response.headers['location']).toBe('/docs')
  })
})
