import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: '../../prisma/schema/auth.prisma',
  migrations: {
    path: 'prisma/migrations/auth',
  },
  datasource: {
    url: process.env['PG_URL'],
  },
});
