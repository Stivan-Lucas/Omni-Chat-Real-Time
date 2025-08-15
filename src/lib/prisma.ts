// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { env } from '../config/environment.ts'
import { app } from '../app.ts'
import { Texts } from '../constants/texts.ts'

// === Singleton global para desenvolvimento com hot-reload ===
// Evita múltiplas conexões desnecessárias no DB
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma: PrismaClient =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'], // menos verboso em produção
  })

// Salva no global para não recriar instâncias em hot-reload
if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// === Configuração inicial do banco ===
async function initPrisma() {
  try {
    // Conecta automaticamente (opcional, Prisma conecta na primeira query)
    await prisma.$connect()
    app.log.info(Texts.database.connection.success)
  } catch (error) {
    app.log.error({ error }, Texts.database.connection.error)
    process.exit(1) // encerra app se não conseguir conectar
  }
}

// Executa inicialização automaticamente
initPrisma()
