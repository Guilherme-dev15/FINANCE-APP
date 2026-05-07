import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  // ... suas outras configs ...
  
  // Adicione este bloco abaixo:
  datasource: {
    url: env("DATABASE_URL"),
  },
})