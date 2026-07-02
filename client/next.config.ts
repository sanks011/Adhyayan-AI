import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Firebase uses ESM-only exports that Next.js webpack cannot resolve
  // server-side without explicit transpilation. Adding them here forces
  // Next.js to handle their module resolution through its own pipeline.
  transpilePackages: ["firebase", "@firebase/auth", "@firebase/firestore", "@firebase/storage", "@firebase/functions", "@firebase/app"],
  // Enable SWC styled-components support to ensure stable class names between
  // server and client rendering and avoid hydration mismatches when using
  // styled-components.
  compiler: {
    styledComponents: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
