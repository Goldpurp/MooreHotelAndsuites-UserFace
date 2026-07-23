export type AppEnvironment = "local" | "production";
export type ApiMode = "proxy" | "direct";

const knownEnvironments = new Set<AppEnvironment>([
  "local",
  "production",
]);

function resolveEnvironment(): AppEnvironment {
  const configured = import.meta.env.VITE_APP_ENV?.trim().toLowerCase();
  if (configured && knownEnvironments.has(configured as AppEnvironment)) {
    return configured as AppEnvironment;
  }
  throw new Error("VITE_APP_ENV must be local or production.");
}

function resolveApiMode(): ApiMode {
  const configured = import.meta.env.VITE_API_MODE?.trim().toLowerCase();
  if (configured === "proxy" || configured === "direct") return configured;
  throw new Error("VITE_API_MODE must be either 'proxy' or 'direct'.");
}

function isLoopback(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function resolveApiBaseUrl(environment: AppEnvironment, apiMode: ApiMode): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!configured) {
    throw new Error(
      "VITE_API_BASE_URL is missing. Select a checked-in environment profile or add a local override.",
    );
  }

  if (configured.startsWith("/")) {
    if (apiMode !== "proxy") {
      throw new Error("A root-relative VITE_API_BASE_URL requires VITE_API_MODE=proxy.");
    }
    return configured.replace(/\/$/, "");
  }

  if (apiMode !== "direct") {
    throw new Error("An absolute VITE_API_BASE_URL requires VITE_API_MODE=direct.");
  }

  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new Error("VITE_API_BASE_URL must be an absolute URL or a root-relative path.");
  }

  if (environment === "production" && url.protocol !== "https:") {
    throw new Error("The production API must use HTTPS.");
  }

  if (environment === "production" && isLoopback(url.hostname)) {
    throw new Error("The production API cannot use a local or loopback host.");
  }

  if (environment === "local" && !isLoopback(url.hostname)) {
    throw new Error("Local can only target a localhost or loopback API.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("The API URL must use HTTP or HTTPS.");
  }

  return url.toString().replace(/\/$/, "");
}

function resolveRequestTimeout(): number {
  const value = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 15_000);
  return Number.isFinite(value) ? Math.min(60_000, Math.max(3_000, value)) : 15_000;
}

function resolveBoolean(name: string, value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  throw new Error(`${name} must be either true or false.`);
}

const environment = resolveEnvironment();
const apiMode = resolveApiMode();

export const appConfig = Object.freeze({
  environment,
  apiMode,
  apiBaseUrl: resolveApiBaseUrl(environment, apiMode),
  requestTimeoutMs: resolveRequestTimeout(),
  monnifyEnabled: resolveBoolean(
    "VITE_MONNIFY_ENABLED",
    import.meta.env.VITE_MONNIFY_ENABLED,
  ),
  isLocal: environment === "local",
  isProduction: environment === "production",
});
