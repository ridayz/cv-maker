import type { MetadataRoute } from "next";
import { listCvs } from "@/lib/db";

// sitemap sederhana: landing + semua CV published
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3901";
  const published = listCvs().filter((c) => c.status === "published");
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...published.map((c) => ({
      url: `${base}/cv/${c.slug}`,
      lastModified: new Date(c.updated_at.replace(" ", "T") + "Z"),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
