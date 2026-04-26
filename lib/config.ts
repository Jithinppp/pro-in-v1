export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "PROIN",
  tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || "Asset Management System",
} as const;