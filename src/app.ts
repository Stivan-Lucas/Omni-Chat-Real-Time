// src/app.ts
import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { env } from './config/environment.ts'

import { loggerOptions } from './modules/logger.ts'
import RateLimited from './modules/rateLimit.ts'
import handleError from './modules/handleError.ts'

import SwaggerPlugin from './lib/swagger.ts'
import ScalarPlugin from './lib/scalar.ts'
import AuthRoutes from './routes/auth.routes.ts'
import UsersRoutes from './routes/users.routes.ts'

export const app = Fastify({
  logger: loggerOptions,
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, { origin: env.CORS_ORIGIN })
app.register(handleError)

await RateLimited(app)
await SwaggerPlugin(app)
await ScalarPlugin(app)

await AuthRoutes(app)
await UsersRoutes(app)

app.ready()
