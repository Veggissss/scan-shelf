// Github Pages requires a base path of /scan-shelf, while local development does not.
// BasePath env var is defined in next.config.mjs
const basePath : string = process.env.BASE_PATH || "";

const isPagesConfig : boolean = process.env.NEXT_PUBLIC_DEPLOY_ENVIRONMENT === "pages";
const isDevOrTestEnv : boolean = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

export { basePath, isPagesConfig, isDevOrTestEnv };