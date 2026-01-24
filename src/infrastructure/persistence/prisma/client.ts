import { PrismaClient } from '@prisma/client';
import { env } from '@config/env';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

export default prisma;