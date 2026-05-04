import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'

if (typeof WebSocket !== 'undefined') {
  neonConfig.webSocketConstructor = WebSocket
}

const connectionString = process.env.DATABASE_URL!
let adapter: PrismaNeon | undefined

// Only initialize adapter if we actually have a connection string,
// which prevents crashing during initial build/dev without DB config.
if (connectionString) {
  adapter = new PrismaNeon({ connectionString })
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
