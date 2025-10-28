import { config } from 'dotenv';
import path from 'node:path';
import type { PrismaConfig } from 'prisma';

config();

export default {
  schema: path.join('src/prisma', 'schema.prisma')
} satisfies PrismaConfig;
