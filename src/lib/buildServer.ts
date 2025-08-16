// src/lib/buildServer.ts
import Fastify from 'fastify'
import AuthRoutes from '../routes/auth.routes.ts'
import { prisma } from './prisma.ts'

export function buildServer() {
  const app = Fastify({
    logger: false, // desativa logs durante os testes
  })

  // Registra suas rotas
  app.register(AuthRoutes)

  // Opcional: hook para limpar banco antes de cada teste, se quiser
  app.addHook('onClose', async () => {
    await prisma.$disconnect()
  })

  return app
}
