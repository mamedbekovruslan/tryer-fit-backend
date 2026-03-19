const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
];

export function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
}

export function getJwtSecret(): string {
  return getRequiredEnv('JWT_SECRET');
}

export function getJwtExpiresIn(): number {
  const value = process.env.JWT_EXPIRES_IN?.trim();

  if (!value) {
    return 3600;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3600;
}

export function getAllowedOrigins(): string[] {
  const configuredOrigins = [
    process.env.FRONTEND_URL,
    ...(process.env.ALLOWED_ORIGINS?.split(',') ?? []),
  ];

  return [...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins]
    .filter((value): value is string => Boolean(value))
    .map(normalizeOrigin)
    .filter((value): value is string => Boolean(value));
}

function normalizeOrigin(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed.replace(/\/+$/, '');
  }
}
