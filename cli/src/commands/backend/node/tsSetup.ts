import fs from 'fs-extra';
import path from 'path';
import installDependencies from '../../utils/installDep.js';

async function setupTS(projectPath: string) {
  const tsConfigPath = path.join(projectPath, 'tsconfig.json');

  try {
    const tsConfigOpts = {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'node',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        outDir: './dist',
        rootDir: './src',
      },
      include: ['src/**/*'],
      exclude: ['node_modules'],
    };

    await fs.writeJSON(tsConfigPath, tsConfigOpts, { spaces: 2 });

    await installDependencies({
      backendPath: projectPath,
      devDependencies: ['typescript', 'tsx'],
    });

    const pkgJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));

    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.dev = 'tsx watch src/index.ts';

    fs.writeFileSync(pkgJsonPath, JSON.stringify(packageJson, null, 2));
  } catch (error) {
    throw new Error(`Failed to add Typescript 🔴: ${error}`);
  }
}

export default setupTS;
