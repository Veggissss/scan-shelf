const isPagesConfig : boolean = process.env.NEXT_PUBLIC_DEPLOY_ENVIRONMENT === "pages";
const isDevOrTestEnv : boolean = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

// Github Pages requires a base path of /scan-shelf, while local development does not.
const basePath = isPagesConfig ? '/scan-shelf' : '';

export { basePath, isPagesConfig, isDevOrTestEnv };