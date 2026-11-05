import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Beyonn: the OSA + TMD program your team can run",
    short_name: "Beyonn",
    description: "Add Obstructive Sleep Apnea and TMD treatment to your practice. Beyonn trains your team, gives you the systems and coaches you until it runs.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1c395e",
    icons: [
      { src: "/icon.png", sizes: "256x256", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
