import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BLINI HOME — Gjithçka për Shtëpinë",
    short_name: "BLINI HOME",
    description:
      "Produkte cilësore për shtëpinë, familjen dhe veten tuaj me çmimet më të mira në Kosovë.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFFFF",
    theme_color: "#062F35",
    lang: "sq",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Të gjitha produktet",
        short_name: "Produktet",
        url: "/koleksion/te-gjitha",
      },
      {
        name: "Oferta",
        short_name: "Oferta",
        url: "/koleksion/oferta",
      },
      {
        name: "Ndiq porosinë",
        short_name: "Ndiq",
        url: "/ndiq-porosine",
      },
    ],
  };
}
