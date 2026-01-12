import { PrismaClient } from '@prisma/client';
import { config } from './index';

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
export const prisma = global.prisma || new PrismaClient({
    log: config.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (config.env !== 'production') {
    global.prisma = prisma;
}

export default prisma;
