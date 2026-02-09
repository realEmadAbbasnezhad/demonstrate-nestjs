import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: '../../prisma/schema/catalog.prisma',
  migrations: {
    path: 'prisma/migrations/catalog',
  },
  datasource: {
    url: process.env['MONGO_URL'],
  },
});
