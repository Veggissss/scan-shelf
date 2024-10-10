/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: true, // Enable React strict mode for better error handling

  output: 'export', // For static export
  trailingSlash: true, // Ensures all routes are exported with a trailing slash

  // Asset directory for the static export
  images: {
    unoptimized: true, // Disable Next.js image optimization for static export
  },

  // Additional configuration for base path if hosted on GitHub Pages
  basePath: '/scan-shelf',
  assetPrefix: '/scan-shelf/',

  // Customize Webpack for any additional modifications
  webpack: (config) => {
    // Example: Customize or add loaders
    return config;
  },
};

export default withPWA({
  dest: 'public', // Destination for service worker and related files
  disable: process.env.NODE_ENV === 'development', // Disable in development mode
  register: true, // Automatically registers the service worker
  skipWaiting: true, // Automatically activates updated service workers
})(nextConfig);
