import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Laisser Prisma (et autres paquets serveur) hors du bundle Turbopack
  // évite la création de jonctions NTFS — impossibles sur un lecteur
  // réseau SMB (« failed to create junction point », os error 80).
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs", "@anthropic-ai/sdk"],
};

export default nextConfig;
