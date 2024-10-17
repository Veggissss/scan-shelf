/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';
import { basePath, isPageConfig } from './src/app/basePath';

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
};

const nextPagesConfig = {
  reactStrictMode: true, // Enable React strict mode for better error handling
  trailingSlash: true, // Ensures all routes are exported with a trailing slash

  output: 'export',

  // Asset directory for the static export
  images: {
    unoptimized: true, // Disable Next.js image optimization for static export
  },

  // Additional configuration for base path if hosted on GitHub Pages
  basePath: basePath,
  assetPrefix: `./`,

  // Customize Webpack for any additional modifications
  webpack: (config) => {
    // Example: Customize or add loaders
    return config;
  },
};

const appliedConfig = isPageConfig ? nextPagesConfig : nextConfig;
export default withPWA({
  dest: 'public', // Destination for service worker and related files
  disable: process.env.NODE_ENV === 'development', // Disable in development mode
  register: true, // Automatically registers the service worker
  skipWaiting: true, // Automatically activates updated service workers
})(appliedConfig);
