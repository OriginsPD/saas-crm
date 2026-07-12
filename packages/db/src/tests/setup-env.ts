process.env.SKIP_ENV_VALIDATION ??= "true";
process.env.DATABASE_URL ??=
	"postgres://postgres:postgres@localhost:5432/portfolio_saas_crm";
process.env.BETTER_AUTH_SECRET ??= "test-auth-secret-with-minimum-length";
process.env.BETTER_AUTH_URL ??= "http://localhost:3000";
process.env.CORS_ORIGIN ??= "http://localhost:3001";
