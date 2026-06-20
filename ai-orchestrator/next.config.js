/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig

webpack: (config) => {
  config.module.rules.push({
    test: /\.(glsl|vs|fs|vert|frag)$/,
    type: 'asset/source',
  })
  return config
}
