import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'

if (typeof WebSocket !== 'undefined') {
  neonConfig.webSocketConstructor = WebSocket
}

const connectionString = process.env.DATABASE_URL
let adapter: PrismaNeon | undefined

if (connectionString) {
  adapter = new PrismaNeon({ connectionString })
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  (adapter
    ? new PrismaClient({ adapter })
    : new PrismaClient({
        datasources: {
          db: { url: 'postgresql://dummy:dummy@localhost:5432/dummy' },
        },
      }))

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
