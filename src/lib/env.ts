// Validated environment variables with clear error messages

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(
      `Missing environment variable: ${key}\n` +
      `Copy .env.example to .env and fill in the required values.`
    );
  }
  return value;
}

export const env = {
  get DATABASE_URL() {
    return getEnv("DATABASE_URL");
  },
  get PISTON_URL() {
    return getEnv("PISTON_URL", "https://emkc.org/api/v2/piston");
  },
  get ANTHROPIC_API_KEY() {
    return process.env.ANTHROPIC_API_KEY || "";
  },
  get ADMIN_KEY() {
    return process.env.ADMIN_KEY || "";
  },
  get hasAnthropicKey() {
    const key = this.ANTHROPIC_API_KEY;
    return key.length > 0 && key !== "your-anthropic-api-key-here";
  },
  get hasAdminKey() {
    const key = this.ADMIN_KEY;
    return key.length > 0 && key !== "change-this-to-a-secure-admin-key";
  },
};
