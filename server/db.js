import pg from 'pg';

const { Pool } = pg;

const DEFAULT_DATABASE = 'netflix-clone';

const getDatabaseName = () => {
  if (globalThis.process.env.PGDATABASE) {
    return globalThis.process.env.PGDATABASE;
  }

  if (globalThis.process.env.DATABASE_URL) {
    try {
      return new URL(globalThis.process.env.DATABASE_URL).pathname.replace(/^\//, '') || DEFAULT_DATABASE;
    } catch {
      return DEFAULT_DATABASE;
    }
  }

  return DEFAULT_DATABASE;
};

const getMaintenanceConfig = () => {
  if (globalThis.process.env.DATABASE_URL) {
    const url = new URL(globalThis.process.env.DATABASE_URL);
    url.pathname = '/template1';
    return { connectionString: url.toString() };
  }

  return {
    user: globalThis.process.env.PGUSER || 'postgres',
    host: globalThis.process.env.PGHOST || 'localhost',
    database: 'template1',
    password: globalThis.process.env.PGPASSWORD || 'Da1993Gi',
    port: Number(globalThis.process.env.PGPORT) || 5432,
  };
};

const getMainPoolConfig = () => {
  if (globalThis.process.env.DATABASE_URL) {
    const url = new URL(globalThis.process.env.DATABASE_URL);
    url.pathname = `/${databaseName}`;
    return { connectionString: url.toString() };
  }

  return {
    user: globalThis.process.env.PGUSER || 'postgres',
    host: globalThis.process.env.PGHOST || 'localhost',
    database: databaseName,
    password: globalThis.process.env.PGPASSWORD || 'Da1993Gi',
    port: Number(globalThis.process.env.PGPORT) || 5432,
  };
};

export const databaseName = getDatabaseName();

export const ensureDatabaseExists = async () => {
  const maintenancePool = new Pool(getMaintenanceConfig());

  try {
    const existsResult = await maintenancePool.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);

    if (existsResult.rowCount === 0) {
      await maintenancePool.query(`CREATE DATABASE "${databaseName.replace(/"/g, '""')}"`);
    }
  } finally {
    await maintenancePool.end();
  }
};

const pool = new Pool(getMainPoolConfig());

export default pool;