import {
  intro,
  outro,
  text,
  select,
  confirm,
  spinner,
  isCancel,
} from '@clack/prompts';
import chalk from 'chalk';
import figlet from 'figlet';
import createBackend from './commands/createBackend.js';
import initGit from './commands/initGit.js';

intro(
  chalk.blue(
    '\n' +
      figlet.textSync('EZ App', {
        font: 'Standard',
        horizontalLayout: 'fitted',
        verticalLayout: 'fitted',
      }),
  ),
);

let isCancelling = false;

process.on('SIGINT', async () => {
  if (isCancelling) return;
  isCancelling = true;

  const shouldExit = await confirm({
    message: 'Do you really want to cancel this operation?',
  });

  if (shouldExit) {
    console.log(chalk.red('\nProcess canceled. Exiting...'));
    process.exit(0);
  }

  console.log(chalk.green('Resuming process...'));
  isCancelling = false;
});

async function promptWrapper<T>(promptFunc: () => Promise<T>): Promise<T> {
  const response = await promptFunc();

  if (isCancel(response)) {
    const shouldExit = await confirm({
      message: 'Do you really want to cancel this operation?',
    });

    if (shouldExit) {
      console.log(chalk.red('\nOperation canceled. Exiting...'));
      process.exit(0);
    }

    console.log(chalk.green('Resuming process...'));
    return promptWrapper(promptFunc); // Re-run the prompt
  }

  return response;
}

async function main() {
  try {
    const projectName = await promptWrapper(() =>
      text({
        message: 'Name of the project?',
        placeholder: 'my-app',
        validate: (value) => {
          if (!value) return 'Project name is required.';
          if (!/^[a-z0-9-]+$/.test(value))
            return 'Project name must be lowercase.';
          return undefined;
        },
        initialValue: 'my-app',
      }),
    );

    const directoryStructure = await promptWrapper(() =>
      select({
        message: 'Choose your directory structure',
        options: [
          { value: 'client-server', label: 'client/server (default)' },
          { value: 'frontend-backend', label: 'front-end/back-end' },
          { value: 'custom', label: 'Custom' },
        ],
        initialValue: 'client-server',
      }),
    );

    let frontendDir = 'client',
      backendDir = 'server';

    if (directoryStructure === 'frontend-backend') {
      frontendDir = 'front-end';
      backendDir = 'back-end';
    } else if (directoryStructure === 'custom') {
      frontendDir = await promptWrapper(
        async () =>
          (await text({
            message: 'Enter your frontend directory name:',
            placeholder: 'frontend',
            validate: (value) =>
              !value ? 'Directory name is required.' : undefined,
          })) as string,
      );

      backendDir = await promptWrapper(
        async () =>
          (await text({
            message: 'Enter your backend directory name:',
            placeholder: 'backend',
            validate: (value) =>
              !value ? 'Directory name is required.' : undefined,
          })) as string,
      );
    }

    const useTypescript = await promptWrapper(() =>
      confirm({
        message: 'Would you like to use Typescript? (Rly??)',
      }),
    );

    // TODO: Frontend Implementation

    const runtime = await promptWrapper(() =>
      select({
        message: 'Choose a backend runtime: ',
        options: [
          { value: 'node', label: 'Node.js' },
          { value: 'bun', label: 'Bun' },
          { value: 'deno', label: 'Deno' },
        ],
        initialValue: 'node',
      }),
    );

    const useDB = await promptWrapper(() =>
      confirm({
        message: 'Will you use a database for the backend?',
      }),
    );

    let orm, db;

    if (useDB) {
      orm = await promptWrapper(() =>
        select({
          message: 'Choose an ORM: ',
          options: [
            { value: 'prisma', label: 'Prisma' },
            { value: 'drizzle', label: 'Drizzle' },
            { value: 'none', label: 'None (raw queries? damnnn)' },
          ],
        }),
      );

      if (orm !== 'none') {
        db = await promptWrapper(() =>
          select({
            message: 'Choose a database: ',
            options: [
              { value: 'postgresql', label: 'PostgreSQL' },
              { value: 'mysql', label: 'MySQL' },
              { value: 'sqlite', label: 'SQLite' },
              { value: 'mongodb', label: 'MongoDB' },
            ],
          }),
        );
      }
    }

    const initializeGit = await promptWrapper(() =>
      confirm({
        message: 'Do you want to initialize a Git repository?',
      }),
    );

    console.log();
    const s = spinner();
    s.start('Creating your project...');
    await createBackend({
      backendDir,
      runtime,
      useTypescript,
      useDB,
      db,
      orm,
    });

    if (initializeGit) await initGit();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    s.stop();
    outro(
      chalk.green(
        `Your project is ready!\n\n` +
          `Project Name: ${projectName as string}\n` +
          `Folder structure:\n` +
          `- ${chalk.bold(frontendDir)}: Frontend (None)\n` +
          `- ${chalk.bold(backendDir)}: Backend (${useDB ? `with ${orm as string} and ${db as string}` : 'no database'})\n\n` +
          `Next steps:\n` +
          `1. cd ${projectName as string}\n` +
          `2. Install dependencies: ${chalk.bold('pnpm install')}\n` +
          `3. Start developing: ${chalk.bold('pnpm dev')}`,
      ),
    );
  } catch (error) {
    //@ts-expect-error 'Error is undefined pa'
    outro(chalk.red('❌ Error: ' + (error.message || error)));
    process.exit(1);
  }
}

main();
