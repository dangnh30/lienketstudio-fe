import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/shared/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Môi trường staging: đặt NEXT_PUBLIC_NOINDEX=true để chặn Google index
  if (process.env.NEXT_PUBLIC_NOINDEX === "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/app", "/admin", "/login", "/signup"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
