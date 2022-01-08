import { resolve } from 'path';

const migrations = {
  directory: resolve('server', 'migrations'),
};

const seeds = {
  directory: resolve('server', 'seeds'),
};

export default {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3',
    },
    pool: {
      afterCreate(conn, done) {
        conn.run('PRAGMA foreign_keys = ON', done);
      },
    },
    useNullAsDefault: true,
    migrations,
    seeds,
  },
  test: {
    client: 'sqlite3',
    connection: ':memory:',
    pool: {
      afterCreate(conn, done) {
        conn.run('PRAGMA foreign_keys = ON', done);
      },
    },
    useNullAsDefault: true,
    migrations,
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
    },
    useNullAsDefault: true,
    migrations,
  },
};
