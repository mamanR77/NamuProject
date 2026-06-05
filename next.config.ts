import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Form Kunjungan Umum mengirim foto identitas + swafoto (base64) via server action.
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
