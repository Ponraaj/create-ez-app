import {
  intro,
  outro,
  text,
  select,
  confirm,
  spinner,
  isCancel,
} from '@clack/prompts';
import { execSync } from 'child_process';
import chalk from 'chalk';
import figlet from 'figlet';
import { pastel } from 'gradient-string';
import initGit from './commands/initGit.js';
import initBackend from './commands/backend/index.js';

const gradientText =
  '\n' +
  pastel.multiline(
    figlet.textSync('EZ App', {
      font: 'Standard',
      horizontalLayout: 'fitted',
      verticalLayout: 'fitted',
    }),
  );
intro(gradientText);

let isCancelling = false;

function detectAvailableRuntimes(): { value: string; label: string }[] {
  const runtimeOptions = [];

  try {
    execSync('node -v', { stdio: 'ignore' });
    runtimeOptions.push({ value: 'node', label: '🟢 Node.js' });
  } catch {
    console.log(chalk.grey('Node is not available'));
  }

  // TODO: Not now
  // try {
  //   execSync('bun -v', { stdio: 'ignore' });
  //   runtimeOptions.push({ value: 'bun', label: '🍞 Bun' });
  // } catch {
  //   console.log(chalk.grey('Bun is not available'));
  // }
  // TODO: Not now
  // try {
  //   execSync('deno --version', { stdio: 'ignore' });
  //   runtimeOptions.push({ value: 'deno', label: '🦕 Deno' });
  // } catch {
  //   console.log(chalk.grey('Deno is not available'));
  // }

  return runtimeOptions;
}

process.on('SIGINT', async () => {
  if (isCancelling) return;
  isCancelling = true;

  const shouldExit = await confirm({
    message: chalk.yellow('⚠️ Do you really want to cancel this operation?'),
  });

  if (shouldExit) {
    console.log(chalk.red('\n❌ Process canceled. Exiting...'));
    process.exit(0);
  }

  console.log(chalk.green('✅ Resuming process...'));
  isCancelling = false;
});

async function promptWrapper<T>(promptFunc: () => Promise<T>): Promise<T> {
  const response = await promptFunc();

  if (isCancel(response)) {
    const shouldExit = await confirm({
      message: chalk.yellow('⚠️ Do you really want to cancel this operation?'),
    });

    if (shouldExit) {
      console.log(chalk.red('\n❌ Operation canceled. Exiting...'));
      process.exit(0);
    }

    console.log(chalk.green('✅ Resuming process...'));
    return promptWrapper(promptFunc); // Re-run the prompt
  }

  return response;
}

async function main() {
  try {
    console.log(chalk.cyan('🚀 Welcome to EZ App CLI Setup!'));
    console.log(chalk.gray('-----------------------------------\n'));

    let projectName = await promptWrapper(
      async () =>
        (await text({
          message: chalk.blue('📌 Name of the project?'),
          placeholder: 'ez-app',
          validate: (value) => {
            if (!value.trim()) return undefined;
            if (!/^[a-z0-9-]+$/.test(value))
              return '⚠️ Project name must be lowercase without spaces.';
            return undefined;
          },
        })) as string,
    );

    projectName = projectName || 'ez-app';

    const directoryStructure = await promptWrapper(
      async () =>
        (await select({
          message: chalk.blue('📁 Choose your directory structure'),
          options: [
            { value: 'client-server', label: '🖥️ client/server (default)' },
            { value: 'frontend-backend', label: '🌐 frontend/backend' },
            { value: 'custom', label: '⚙️ Custom' },
          ],
          initialValue: 'client-server',
        })) as string,
    );

    let frontendDir = 'client',
      backendDir = 'server';

    if (directoryStructure === 'frontend-backend') {
      frontendDir = 'frontend';
      backendDir = 'backend';
    } else if (directoryStructure === 'custom') {
      frontendDir = await promptWrapper(
        async () =>
          (await text({
            message: chalk.magenta('🖼️ Enter your frontend directory name:'),
            placeholder: 'frontend',
            validate: (value) => {
              if (!value) return '⚠️ Directory name is required.';
              if (!/^[a-z0-9-]+$/.test(value))
                return '⚠️ Project name must be lowercase without spaces.';
              return undefined;
            },
          })) as string,
      );

      backendDir = await promptWrapper(
        async () =>
          (await text({
            message: chalk.magenta('🗄️ Enter your backend directory name:'),
            placeholder: 'backend',
            validate: (value) => {
              if (!value) return '⚠️ Directory name is required.';

              if (!/^[a-z0-9-]+$/.test(value))
                return '⚠️ Project name must be lowercase without spaces.';
              if (value === frontendDir)
                return '⚠️ Directory name conflicts with Frontend directory.';
              return undefined;
            },
          })) as string,
      );
    }

    const useTS = await promptWrapper(
      async () =>
        (await confirm({
          message: chalk.yellow(
            '⚡ Would you like to use TypeScript? (Rly ??)',
          ),
        })) as boolean,
    );

    let beFrameworkOptions: { value: string; label: string }[];

    const runtime = await promptWrapper(async () => {
      const availableRuntimes = detectAvailableRuntimes();

      if (availableRuntimes.length === 0) {
        chalk.red(
          '❌ No supported runtimes found. Install Node.js, Bun, or Deno.',
        );
        process.exit(0);
      }
      return (await select({
        message: chalk.blue('⚙️ Choose a backend runtime: '),
        options: availableRuntimes,
        initialValue: 'node',
      })) as string;
    });

    if (runtime === 'node') {
      beFrameworkOptions = [
        { value: 'express', label: 'Express' },
        { value: 'fastify', label: 'Fastify (Faster than Express)' },
        // { value: 'koa', label: 'Koa (Minimal Alternative)' },
        // { value: 'hapi', label: 'Hapi (Enterprise Focused)' },
      ];
    }
    // else if (runtime === 'bun') {
    //   beFrameworkOptions = [
    //     { value: 'hono', label: 'Hono (Best for Bun, super fast ⚡)' },
    //     { value: 'express', label: 'Express (Compatible but slower)' },
    //     { value: 'fastify', label: 'Fastify (Fast but Bun-native is better)' },
    //   ];
    // } else if (runtime === 'deno') {
    //   beFrameworkOptions = [
    //     { value: 'oak', label: 'Oak (Deno’s default choice)' },
    //     { value: 'hono', label: 'Hono (Deno compatible & lightweight)' },
    //     { value: 'abc', label: 'ABC (Simple and tiny)' },
    //     { value: 'none', label: 'None (Use Deno’s built-in server)' },
    //   ];
    // }
    //
    const beFramework = await promptWrapper(
      async () =>
        (await select({
          message: `Choose a backend framework for ${runtime}:`,
          options: beFrameworkOptions,
          initialValue: beFrameworkOptions[0]?.value,
        })) as string,
    );

    const useDB = await promptWrapper(
      async () =>
        (await confirm({
          message: chalk.yellow('🗃️ Will you use a database for the backend?'),
        })) as boolean,
    );

    let orm, db;

    if (useDB) {
      orm = await promptWrapper(
        async () =>
          (await select({
            message: chalk.blue('📊 Choose an ORM: '),
            options: [
              { value: 'prisma', label: '✨ Prisma' },
              // { value: 'drizzle', label: '💧 Drizzle' },
              // { value: 'none', label: '🚀 None (Raw Queries)' },
            ],
          })) as string,
      );

      if (orm !== 'none') {
        db = await promptWrapper(
          async () =>
            (await select({
              message: chalk.blue('💾 Choose a database: '),
              options: [
                { value: 'postgresql', label: '🐘 PostgreSQL' },
                { value: 'mysql', label: '🐬 MySQL' },
                { value: 'sqlite', label: '🗂️ SQLite' },
                { value: 'mongodb', label: '🍃 MongoDB' },
              ],
            })) as string,
        );
      }
    }

    const initializeGit = await promptWrapper(
      async () =>
        await confirm({
          message: chalk.yellow(
            '🔧 Do you want to initialize a Git repository?',
          ),
        }),
    );

    const s = spinner();
    s.start(pastel('⚙️ Creating your project...'));

    await initBackend({
      projectDir: projectName as string,
      backendDir,
      runtime,
      beFramework,
      useTS,
      useDB,
      db,
      orm,
    });

    if (initializeGit) await initGit();

    s.stop(chalk.green('✅ Done!'));

    outro(
      chalk.green(
        `🎉 Your project is ready!\n\n` +
          `📌 Project Name: ${chalk.bold(projectName)}\n` +
          `📁 Folder structure:\n` +
          `- ${chalk.bold(frontendDir)}: Frontend (None)\n` +
          `- ${chalk.bold(backendDir)}: Backend (${useDB ? `with ${orm as string} and ${db as string}` : 'no database'})\n\n` +
          `🚀 Next steps:\n` +
          `1. cd ${chalk.bold(projectName)}\n` +
          `2. Install dependencies: ${chalk.bold('npm install')}\n` +
          `3. Start developing: ${chalk.bold('npm dev')}\n`,
      ),
    );
  } catch (error) {
    //@ts-expect-error 'Error is undefined pa'
    outro(chalk.redBright(`❌ Error: ${error.message || error}`));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
});
