import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function constructMetadata({
  title = "",
  description = "",
  image = "/",
  icons = "/",
} = {}) {
  return {
    title,
    description,
    icons,
    openGraph: {
      title,
      description,
      siteName: "",
      url: "https://www.example.com",
      type: "website",
      images: [{ url: image }]
    },
    metadataBase: new URL('https://example.xyz')
  };
}