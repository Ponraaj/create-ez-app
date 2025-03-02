import fs from 'fs-extra';
import path from 'path';
import installDependencies from './installDep.js';

interface ORMConfig {
  backendPath: string;
  orm: string;
  db: string;
}

const dbConnectionStrings: Record<string, string> = {
  postgresql: 'postgresql://user:password@localhost:5432/dbname',
  mysql: 'mysql://user:password@localhost:3306/dbname',
  sqlite: 'file:./dev.db',
  mongodb: 'mongodb+srv://user:password@cluster.mongodb.net/dbname',
};

async function setupPrisma(backendPath: string, db: string): Promise<void> {
  const ormPath = path.join(backendPath, 'prisma');
  await fs.ensureDir(ormPath);

  const schemaContent = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${db}"
  url      = env("DATABASE_URL")
}
`;
  await fs.writeFile(path.join(ormPath, 'schema.prisma'), schemaContent);
}

async function setupEnvFile(backendPath: string, db: string): Promise<void> {
  const envPath = path.join(backendPath, '.env');

  if (fs.existsSync(envPath)) return;

  const dbConnectionString = dbConnectionStrings[db];

  const envContent = `# Environment Variables
DATABASE_URL="${dbConnectionString}"
`;

  await fs.writeFile(envPath, envContent);
}

async function setupORM(opts: ORMConfig): Promise<void> {
  const { backendPath, db, orm } = opts;
  const deps: string[] = [];

  try {
    if (orm === 'prisma') {
      await setupPrisma(backendPath, db);
      await setupEnvFile(backendPath, db);
      deps.push('prisma', '@prisma/client');
      await installDependencies({ backendPath, dependencies: deps });
    }
  } catch (error) {
    throw new Error(`Error Setting up ORM 🔴: ${(error as Error).message}`);
  }
}

export default setupORM;
