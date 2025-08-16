// src/lib/scalar.ts
import { env } from '../config/environment.ts'
import type { FastifyTypedInstance } from '../types/zod.ts'

export default async function ScalarPlugin(app: FastifyTypedInstance) {
  app.get('/', { schema: { hide: true } }, async (_, reply) => {
    return reply.redirect('/docs')
  })

  await app.register(import('@scalar/fastify-api-reference'), {
    routePrefix: '/docs',
    logLevel: env.LOG_LEVEL,
    configuration: {
      url: '/openapi.json',
      theme: 'purple',
    },
  })
}
