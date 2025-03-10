interface paramTypes {
  frontendPath: string;
  useTS?: boolean;
  useTailWind?: boolean;
  useReactRouter?: boolean;
  useShadCN?: boolean;
}
async function initReact(opts: paramTypes) {
  const { frontendPath, useTS, useTailWind, useShadCN, useReactRouter } = opts;

  console.log(frontendPath, useTS, useShadCN, useTailWind, useReactRouter);
  // TODO:
  // 1. Create Vite project in the appropriate frontendPath
  // 2. Setup TailwindCSS
  // 3. Setup ShadCN
  // 4. Setup React Router
}

export default initReact;
