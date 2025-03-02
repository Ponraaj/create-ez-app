import { execSync } from 'child_process';
import setupORM from './ormSetup.js';
import setupTS from './tsSetup.js';
import setupBackend from './backendSetup.js';

const DEFAULT_PKG_MGR = 'npm';

interface paramsTypes {
  backendPath: string;
  useTS: boolean;
  beFramework: string;
  useDB: boolean;
  orm?: string;
  db?: string;
}

async function init(opts: paramsTypes) {
  const { backendPath, useDB, useTS, beFramework, orm, db } = opts;

  execSync(`${DEFAULT_PKG_MGR} init -y`, {
    cwd: backendPath,
    stdio: 'ignore',
  });

  if (useTS) {
    await setupTS(backendPath);
  }

  await setupBackend({ backendPath, useTS, beFramework });

  if (useDB && orm && db) {
    await setupORM({ backendPath, orm, db });
  }
}

export default init;
