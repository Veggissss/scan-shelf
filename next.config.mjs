/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = {
  // Other Next.js configurations can go here if needed
};

export default withPWA({
  dest: 'public', // Destination for service worker and related files
  disable: process.env.NODE_ENV === 'development', // Disable in development mode
})(nextConfig);
