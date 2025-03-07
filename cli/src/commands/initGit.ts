import { execSync } from 'child_process';
import path from 'path';
import chalk from 'chalk';

const initializeGit = async (projectName: string) => {
  const projectPath = path.join(process.cwd(), projectName);

  try {
    execSync('git init', { cwd: projectPath, stdio: 'ignore' });
    console.log(chalk.green('✅ Git repository initialized successfully!'));
  } catch (error) {
    console.error('❌ Failed to initialize Git repository:', error);
  }
};

export default initializeGit;
