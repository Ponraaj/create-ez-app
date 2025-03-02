import fs from 'fs-extra';
import path from 'path/posix';
import backendDirSetup from './dirSetup.js';
import initNode from './node/index.js';

interface paramsTypes {
  projectDir: string;
  backendDir: string;
  useTS: boolean;
  runtime: string;
  beFramework: string;
  useDB: boolean;
  orm?: string;
  db?: string;
}

async function init(opts: paramsTypes) {
  const {
    projectDir,
    backendDir,
    useDB,
    useTS,
    runtime,
    beFramework,
    orm,
    db,
  } = opts;

  const projectPath = path.join(process.cwd(), projectDir);
  const backendPath = path.join(projectPath, backendDir);

  await fs.ensureDir(projectPath);

  await backendDirSetup(projectDir, backendDir);

  if (runtime === 'node') {
    await initNode({ backendPath, useDB, useTS, beFramework, db, orm });
  }

  const pkgJsonPath = path.join(backendPath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

  packageJson.type = 'module';

  fs.writeFileSync(pkgJsonPath, JSON.stringify(packageJson, null, 2));
}

export default init;
