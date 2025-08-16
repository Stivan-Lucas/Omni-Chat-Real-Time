// src/modules/handleError.ts
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from 'fastify-type-provider-zod'
import { Texts } from '../constants/texts.ts'
import type { FastifyTypedInstance } from '../types/zod.ts'

export default function handleError(app: FastifyTypedInstance) {
  app.setErrorHandler(
    (err: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
      if (hasZodFastifySchemaValidationErrors(err)) {
        app.log.warn(
          { err, method: req.method, url: req.url },
          Texts.handleError.errors.validationError.logMessage,
        )
        return reply.code(400).send({
          error: Texts.handleError.errors.validationError.error,
          message: Texts.handleError.errors.validationError.message,
          statusCode: 400,
          details: {
            issues: err.validation,
            method: req.method,
            url: req.url,
          },
        })
      }

      if (isResponseSerializationError(err)) {
        app.log.error(
          { err, method: err.method, url: err.url },
          Texts.handleError.errors.serializationError.logMessage,
        )
        return reply.code(500).send({
          error: Texts.handleError.errors.serializationError.error,
          message: Texts.handleError.errors.serializationError.message,
          statusCode: 500,
          details: {
            issues: err.cause.issues,
            method: err.method,
            url: err.url,
          },
        })
      }

      app.log.error(
        { err, method: req.method, url: req.url },
        Texts.handleError.errors.unexpectedError.logMessage,
      )
      return reply.code(500).send({
        error: Texts.handleError.errors.unexpectedError.error,
        message: Texts.handleError.errors.unexpectedError.message,
        statusCode: 500,
      })
    },
  )
}
