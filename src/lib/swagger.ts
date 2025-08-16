// src/lib/swagger.ts
import fastifySwagger from '@fastify/swagger'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import { env } from '../config/environment.ts'
import { Texts } from '../constants/texts.ts'
import type { FastifyTypedInstance } from '../types/zod.ts'

export default async function SwaggerPlugin(app: FastifyTypedInstance) {
  await app.register(fastifySwagger, {
    mode: 'dynamic',
    transform: jsonSchemaTransform,
    openapi: {
      info: {
        title: env.APP_NAME,
        version: env.APP_VERSION,
        description: Texts.swagger.description,
      },
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'apiKey',
            in: 'header',
          },
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ apiKey: [] }, { bearerAuth: [] }],
    },
  })

  app.get('/openapi.json', { schema: { hide: true } }, async () =>
    app.swagger(),
  )
}
