// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // App directory is now stable in Next.js 14
// }

// module.exports = nextConfig 

/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 14
  
  // External packages that should not be bundled by webpack
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth'],
  },
  
  // Webpack configuration for handling specific packages
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude canvas dependency that pdf-parse tries to use
      config.resolve.alias.canvas = false
      config.resolve.alias.encoding = false
    }
    
    // Ignore node: protocol imports warnings
    config.ignoreWarnings = [
      { module: /node_modules\/pdf-parse/ },
      { module: /node_modules\/mammoth/ },
    ]
    
    return config
  },
}

module.exports = nextConfig