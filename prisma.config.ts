import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema/user.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['PG_URL'],
  },
});
