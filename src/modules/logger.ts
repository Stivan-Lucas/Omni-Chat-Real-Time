import fs from 'fs'
import path from 'path'
import pino, { type LoggerOptions } from 'pino'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '../config/environment.ts'

// --- Garantir que o diretório de logs existe ---
const logDir = path.resolve(env.LOG_DIR)
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })

// --- Detecta ambiente ---
const isDev = env.NODE_ENV === 'development'

// --- Serializers ---
const reqSerializer = (req: FastifyRequest) => ({
  method: req.method,
  url: req.url,
  headers: isDev
    ? req.headers
    : {
        'user-agent': req.headers['user-agent'],
        host: req.headers.host,
      },
})

const serializers = {
  req: reqSerializer,
  res: (reply: FastifyReply) => ({ statusCode: reply.statusCode }),
  err: pino.stdSerializers.err,
}

// --- Paths a serem redatados ---
const redactPaths = env.LOG_REDACT_PATHS
  ? env.LOG_REDACT_PATHS.split(',').map((p) => p.trim())
  : [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-api-key"]',
      '*.password',
    ]

// --- Transportes ---
const devTransport = {
  targets: [
    {
      target: 'pino-pretty',
      options: {
        colorize: env.LOG_PRETTY_COLORIZE !== 'false',
        translateTime:
          env.LOG_PRETTY_TRANSLATE_TIME || 'SYS:yyyy-mm-dd HH:MM:ss',
        ignore: env.LOG_PRETTY_IGNORE || 'pid,hostname',
        singleLine: env.LOG_PRETTY_SINGLE_LINE !== 'false',
      },
      level: env.LOG_LEVEL,
    },
    {
      target: 'pino/file',
      options: {
        destination: path.join(logDir, 'app.log'),
        mkdir: true,
        append: true,
      },
      level: env.LOG_LEVEL,
    },
  ],
}

const prodTransport = {
  targets: [
    {
      target: 'pino/file',
      options: {
        destination: path.join(logDir, 'app.log'),
        mkdir: true,
        append: true,
      },
      level: env.LOG_LEVEL,
    },
    {
      target: 'pino/file',
      options: {
        dirname: logDir,
        filename: 'app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: env.LOG_FILE_MAX_DAYS ? `${env.LOG_FILE_MAX_DAYS}d` : '14d',
        zippedArchive: env.LOG_FILE_ZIPPED === 'true',
      },
      level: env.LOG_LEVEL,
    },
  ],
}

// --- LoggerOptions final ---
export const loggerOptions: LoggerOptions = {
  level: env.LOG_LEVEL,
  serializers,
  redact: { paths: redactPaths, censor: '**REDACTED**' },
  mixin: () => ({
    env: env.NODE_ENV,
    app: env.APP_NAME,
    version: env.APP_VERSION,
  }),
  transport: isDev ? devTransport : prodTransport,
}
