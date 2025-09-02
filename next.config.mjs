// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: true,
//   },
// }

// export default nextConfig



/** @type {import('next').NextConfig} */
const nextConfig = {
eslint: { ignoreDuringBuilds: true },
typescript: { ignoreBuildErrors: true },
images: {
  unoptimized: true,
},
// IMPORTANT: Do not set `output: 'export'` or `assetPrefix` here.
// Leaving them out ensures API routes like /api/chat, /api/faqs, /api/knowledge stay live on Vercel.
}

export default nextConfig
