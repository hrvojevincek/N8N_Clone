import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  reactCompiler: true,
  serverExternalPackages: ["@prisma/client"],

  output: "standalone",

  // Crucial: Tell Next.js to include Prisma binaries in tracing
  outputFileTracingIncludes: {
    "/app/api/**": ["./src/generated/prisma/**/*"],
    "/app/**/*": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
