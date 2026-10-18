/** Projeto próprio da Videira. */
const nextConfig = {
  experimental: { cpus: 1, staticGenerationMaxConcurrency: 1 },
  async rewrites() {
    return [
      {
        source: '/oda/Fonts/:path*',
        destination: 'https://www.odaalvino.com.br/oda/Fonts/:path*',
      },
    ];
  },
};
export default nextConfig;
