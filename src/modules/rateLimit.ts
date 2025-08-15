// src/modules/rateLimit.ts
import fastifyRateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'
import { env } from '../config/environment.ts'
import { Texts } from '../constants/texts.ts'

export default async function RateLimited(app: FastifyInstance) {
  if (env.NODE_ENV === 'development') {
    app.log.info(env.RATE_LIMIT_INFO_MESSAGE)
    return
  }

  await app.register(fastifyRateLimit, {
    ban: env.RATE_LIMIT_BAN,
    max: env.RATE_LIMIT_MAX,
    cache: env.RATE_LIMIT_CACHE,
    timeWindow: env.RATE_LIMIT_WINDOW,
    nameSpace: env.RATE_LIMIT_NAMESPACE,
    global: true,
    skipOnError: true,
    enableDraftSpec: true,

    onExceeding: (request) => {
      app.log.info(Texts.rateLimit.approachingLimit.replace('{ip}', request.ip))
    },
    onExceeded: (request) => {
      app.log.warn(Texts.rateLimit.limitExceeded.replace('{ip}', request.ip))
    },
    onBanReach: (request) => {
      app.log.error(Texts.rateLimit.banned.replace('{ip}', request.ip))
    },

    errorResponseBuilder: (request, context) => {
      app.log.warn(
        Texts.rateLimit.logExceeded
          .replace('{ip}', request.ip)
          .replace('{method}', request.method)
          .replace('{url}', request.url),
      )

      return {
        statusCode: 429,
        error: Texts.rateLimit.error,
        message: Texts.rateLimit.message
          .replace('{max}', context.max.toString())
          .replace('{after}', context.after),
        codigo: Texts.rateLimit.code,
        tempoEspera: context.after,
      }
    },
  })
}
