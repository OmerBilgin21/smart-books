import type { Knex } from 'knex';

const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    database: 'smart_books',
  },
  pool: { min: 2, max: 10 },
};

export default config;
