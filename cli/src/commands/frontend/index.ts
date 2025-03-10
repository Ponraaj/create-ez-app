import path from 'path';
import initReact from './react/index.js';

interface paramTypes {
  projectDir: string;
  frontendDir: string;
  framework: string;
  useTS?: boolean;
  useReactRouter?: boolean;
  useShadCN?: boolean;
}

async function init(opts: paramTypes) {
  const {
    projectDir,
    frontendDir,
    framework,
    useTS,
    useReactRouter,
    useShadCN,
  } = opts;

  const projectPath = path.join(process.cwd(), projectDir);
  const frontendPath = path.join(projectPath, frontendDir);

  if (framework === 'react') {
    await initReact({
      frontendPath: frontendPath,
      useTS: useTS,
      useShadCN: useShadCN,
      useReactRouter: useReactRouter,
    });
  }
}

export default init;
