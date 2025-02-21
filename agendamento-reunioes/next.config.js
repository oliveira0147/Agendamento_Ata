/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'], // Adicione outros domínios se necessário
  },
}

module.exports = nextConfig 