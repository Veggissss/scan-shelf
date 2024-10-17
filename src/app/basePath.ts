// Github Pages requires a base path of /scan-shelf, while local development does not.
const isPagesConfig = process.env.NEXT_PUBLIC_DEPLOY_ENVIRONMENT === 'pages';
const basePath = isPagesConfig ? '/scan-shelf' : '';

export { basePath, isPagesConfig };