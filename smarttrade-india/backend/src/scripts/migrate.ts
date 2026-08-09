import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import { config } from '../config';
import { logger } from '../utils/logger';

const migrationsDir = path.resolve(__dirname, '../../../database/migrations');
const migrationTable = 'schema_migrations';

function getMigrationFiles(): string[] {
  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

async function tableExists(client: Client, tableName: string): Promise<boolean> {
  const result = await client.query(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    ) AS exists`,
    [tableName]
  );
  return result.rows[0]?.exists === true;
}

async function ensureMigrationTable(client: Client): Promise<void> {
  await client.query(
    `CREATE TABLE IF NOT EXISTS ${migrationTable} (
      version VARCHAR(255) PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`
  );
}

async function getAppliedMigrations(client: Client): Promise<Set<string>> {
  const result = await client.query(`SELECT version FROM ${migrationTable}`);
  return new Set(result.rows.map((row) => row.version));
}

async function markMigrationApplied(client: Client, version: string, name: string): Promise<void> {
  await client.query(
    `INSERT INTO ${migrationTable} (version, name, applied_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT DO NOTHING`,
    [version, name]
  );
}

async function runMigrationFile(client: Client, filePath: string): Promise<void> {
  const sql = fs.readFileSync(filePath, 'utf8');
  await client.query(sql);
}

async function main(): Promise<void> {
  const client = new Client({ connectionString: config.DATABASE_URL });
  await client.connect();

  try {
    logger.info('Starting database migration runner', { databaseUrl: config.DATABASE_URL });

    await ensureMigrationTable(client);
    const appliedMigrations = await getAppliedMigrations(client);
    const migrationFiles = getMigrationFiles();

    const usersTableExists = await tableExists(client, 'users');
    if (appliedMigrations.size === 0 && usersTableExists && migrationFiles.length > 0) {
      const firstMigration = migrationFiles[0];
      const version = firstMigration.split('_')[0];
      logger.info('Detected existing schema without migration metadata; marking initial migration as applied', {
        initialMigration: firstMigration,
      });
      await markMigrationApplied(client, version, firstMigration);
    }

    for (const fileName of migrationFiles) {
      const version = fileName.split('_')[0];
      if (appliedMigrations.has(version)) {
        logger.info('Skipping already applied migration', { fileName });
        continue;
      }

      const filePath = path.join(migrationsDir, fileName);
      logger.info('Applying migration', { fileName });
      try {
        await client.query('BEGIN');
        await runMigrationFile(client, filePath);
        await markMigrationApplied(client, version, fileName);
        await client.query('COMMIT');
        logger.info('Migration applied successfully', { fileName });
      } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Migration failed', { fileName, error: (error as Error).message });
        throw error;
      }
    }

    logger.info('Database migration runner completed');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('Database migration runner failed:', error);
  process.exit(1);
});
