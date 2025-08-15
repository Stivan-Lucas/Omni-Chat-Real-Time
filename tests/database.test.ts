// test/database.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '../src/lib/prisma'

describe('Database Connection', () => {
  beforeAll(async () => {
    // Garante que a conexão está aberta antes dos testes
    await prisma.$connect()
  })

  afterAll(async () => {
    // Fecha a conexão após os testes
    await prisma.$disconnect()
  })

  it('should connect to the database', async () => {
    // Tipando explicitamente o resultado como array de objetos com 'result' number
    const result = await prisma.$queryRaw<
      { result: number }[]
    >`SELECT 1 as result;`

    // Agora o TS sabe que 'result[0].result' é number
    expect(result[0].result).toBe(1)
  })
})
