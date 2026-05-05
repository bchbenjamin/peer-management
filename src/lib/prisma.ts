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

const createRecursiveProxy = (name?: string): any => {
  return new Proxy(() => {}, {
    get: (target, prop) => {
      if (prop === 'constructor') return Object;
      if (prop === 'then') return undefined;
      return createRecursiveProxy(String(prop));
    },
    apply: () => {
      return createRecursiveProxy();
    },
  });
};

export const prisma =
  globalForPrisma.prisma ||
  (adapter
    ? new PrismaClient({ adapter })
    : createRecursiveProxy('PrismaProxy'));

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
