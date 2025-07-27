export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "postgres-js", // "pg" 아님! postgres-js가 공식 지원
  dialect: "postgresql", // 필수!
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
};
