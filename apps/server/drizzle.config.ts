import { defineConfig } from "drizzle-kit";
import config from "./src/config/config";

export default defineConfig({
  schema: "./db/schema/*.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: config().database.url as string,
  },
});
