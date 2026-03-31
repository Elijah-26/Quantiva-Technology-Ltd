import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Canonical dashboard routes (from demo paths)
      { source: "/demo/ai/dashboard", destination: "/dashboard", permanent: false },
      { source: "/demo/ai/dashboard/documents", destination: "/dashboard/documents", permanent: false },
      { source: "/demo/ai/dashboard/documents/:id", destination: "/dashboard/documents/:id", permanent: false },
      { source: "/demo/ai/dashboard/research", destination: "/dashboard/ai-research", permanent: false },
      { source: "/demo/ai/dashboard/research/projects", destination: "/dashboard/ai-research/projects", permanent: false },
      { source: "/demo/ai/dashboard/generate", destination: "/dashboard/generate", permanent: false },
      { source: "/demo/ai/dashboard/workspace", destination: "/dashboard/workspace", permanent: false },
      { source: "/demo/ai/dashboard/billing", destination: "/dashboard/billing", permanent: false },
      { source: "/demo/ai/dashboard/settings", destination: "/dashboard/settings", permanent: false },

      // Admin module now under /dashboard/admin/*
      { source: "/demo/ai/admin", destination: "/dashboard/admin", permanent: false },
      { source: "/demo/ai/admin/users", destination: "/dashboard/admin/users", permanent: false },
      { source: "/demo/ai/admin/documents", destination: "/dashboard/admin/documents", permanent: false },
      { source: "/demo/ai/admin/moderation", destination: "/dashboard/admin/moderation", permanent: false },
      { source: "/demo/ai/admin/moderation/:id", destination: "/dashboard/admin/moderation/:id", permanent: false },
      { source: "/demo/ai/admin/templates", destination: "/dashboard/admin/templates", permanent: false },
      { source: "/demo/ai/admin/analytics", destination: "/dashboard/admin/analytics", permanent: false },
      { source: "/demo/ai/admin/settings", destination: "/dashboard/admin/settings", permanent: false },

      // Legacy live dashboard routes moved under /dashboard/research/*
      { source: "/dashboard/new-research", destination: "/dashboard/research/new-research", permanent: false },
      { source: "/dashboard/reports", destination: "/dashboard/research/reports", permanent: false },
      { source: "/dashboard/reports/:id", destination: "/dashboard/research/reports/:id", permanent: false },
      { source: "/dashboard/schedules", destination: "/dashboard/research/schedules", permanent: false },
      { source: "/dashboard/regulatory-guardrail", destination: "/dashboard/research/regulatory-guardrail", permanent: false },
    ];
  },
};

export default nextConfig;
