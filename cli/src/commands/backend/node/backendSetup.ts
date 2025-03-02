import fs from 'fs-extra';
import path from 'path';
import installDependencies from './installDep.js';

interface BackendOptions {
  backendPath: string;
  useTS: boolean;
  beFramework: string;
}

async function setupBackend({
  backendPath,
  useTS,
  beFramework,
}: BackendOptions) {
  const fileExt = useTS ? 'ts' : 'js';
  const importExt = useTS ? '' : `.${fileExt}`;
  const srcPath = path.join(backendPath, 'src');

  ['controllers', 'routes'].forEach((dir) =>
    fs.ensureDirSync(path.join(srcPath, dir)),
  );

  const dependencies = [beFramework];
  const devDependencies = useTS ? [`@types/${beFramework}`] : [];

  await installDependencies({
    backendPath,
    dependencies,
    devDependencies: devDependencies.length ? devDependencies : undefined,
  });

  const indexContent =
    beFramework === 'express'
      ? `import express from 'express';
import helloRoute from './routes/helloRoutes${importExt}';

const app = express();
app.use(express.json());
app.use('/hello', helloRoute);

app.listen(6969, () => console.log('Server running on port 6969'));
`
      : `import Fastify from 'fastify';
import helloRoute from './routes/helloRoutes${importExt}';

const fastify = Fastify({ logger: true });
fastify.register(helloRoute);

fastify.listen({ port: 6969 }, () => console.log('Server running on port 6969'));
`;

  fs.writeFileSync(path.join(srcPath, `index.${fileExt}`), indexContent);

  const controllerContent =
    beFramework === 'express'
      ? `export const sayHello = (req${useTS ? ': any' : ''}, res${useTS ? ': any' : ''}) => {
  res.json({ message: 'Hello !!' });
};`
      : `export const sayHello = async (req${useTS ? ': any' : ''}, res${useTS ? ': any' : ''}) => {
  res.send({ message: 'Hello !!' });
};`;

  fs.writeFileSync(
    path.join(srcPath, 'controllers', `helloController.${fileExt}`),
    controllerContent,
  );

  const routesContent =
    beFramework === 'express'
      ? `import express from 'express';
import { sayHello } from '../controllers/helloController${importExt}';

const router = express.Router();
router.get('/', sayHello);

export default router;`
      : `import { FastifyInstance } from 'fastify';
import { sayHello } from '../controllers/helloController${importExt}';

export default async function (fastify${useTS ? ': FastifyInstance' : ''}) {
  fastify.get('/', sayHello);
}`;

  fs.writeFileSync(
    path.join(srcPath, 'routes', `helloRoutes.${fileExt}`),
    routesContent,
  );
}

export default setupBackend;
