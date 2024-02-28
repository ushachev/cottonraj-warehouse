const commonConfig = {
  client: 'pg',
  connection: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USERNAME,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
  },
  useNullAsDefault: true,
};

export default {
  development: commonConfig,
  test: {
    ...commonConfig,
    migrations: {
      directory: './__tests__/migrations',
    },
    seeds: {
      directory: './__tests__/seeds',
    },
  },
  production: {
    ...commonConfig,
    connection: {
      connectionString: process.env.DATABASE_URL,
    },
  },
};
