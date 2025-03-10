import { execSync } from 'child_process';

interface params {
  backendPath: string;
  dependencies?: string[];
  devDependencies?: string[];
}

const DEFAULT_PKG_MGR = 'npm';

async function installDependencies({
  backendPath,
  dependencies,
  devDependencies,
}: params) {
  try {
    if (dependencies) {
      execSync(`${DEFAULT_PKG_MGR} install ${dependencies.join(' ')}`, {
        cwd: backendPath,
        stdio: 'ignore',
      });
    }

    if (devDependencies) {
      execSync(
        `${DEFAULT_PKG_MGR} install --save-dev ${devDependencies.join(' ')}`,
        {
          cwd: backendPath,
          stdio: 'ignore',
        },
      );
    }
  } catch (error) {
    throw new Error(`Error installing dependencies 🔴: ${error}`);
  }
}

export default installDependencies;
