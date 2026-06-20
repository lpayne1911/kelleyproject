/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Allow larger quote files (PDFs / screenshots) through server actions.
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
