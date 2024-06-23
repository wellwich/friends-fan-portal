import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./app/db/schema.ts",
    out: "./drizzle/migrations",
    driver: "turso",
    dialect: "sqlite",
    dbCredentials: {
        url: ""
    },
});