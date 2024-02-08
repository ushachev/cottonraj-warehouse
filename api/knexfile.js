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
    migrations: {
      directory: './__tests__/migrations',
    },
    seeds: {
      directory: './__tests__/seeds',
    },
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
    },
    useNullAsDefault: true,
  },
};
