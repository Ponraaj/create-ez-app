import fs from 'fs-extra';
import path from 'path';

async function backendDirSetup(projectDir: string, beDir: string) {
  const projectPath = path.join(process.cwd(), projectDir);
  const backendPath = path.join(projectPath, beDir);

  try {
    await fs.ensureDir(backendPath);

    await fs.ensureDir(path.join(backendPath, 'src'));
    await fs.ensureDir(path.join(backendPath, 'src', 'routes'));
    await fs.ensureDir(path.join(backendPath, 'src', 'controllers'));
    await fs.ensureDir(path.join(backendPath, 'src', 'config'));
  } catch (error) {
    throw new Error(`Error creating Backend Directory 🔴: ${error}`);
  }
}

export default backendDirSetup;
