interface CreateBackendProjectOptions {
  backendDir: string | symbol;
  runtime: string | symbol;
  useDB: boolean | symbol;
  useTypescript: boolean | symbol;
  orm?: string | symbol;
  db?: string | symbol;
}

const createBackend = async (opts: CreateBackendProjectOptions) => {
  console.log(opts);
  console.log('Backend pannanum');
};

export default createBackend;
