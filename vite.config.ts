import path from "path";
import { defineConfig, loadEnv, type ProxyOptions } from "vite";
import react from "@vitejs/plugin-react";

type AppEnvironment = "local" | "production";
type ApiMode = "proxy" | "direct";

const expectedProfileByMode: Record<
  string,
  { environment: AppEnvironment; apiMode: ApiMode }
> = {
  localhost: { environment: "local", apiMode: "proxy" },
  production: { environment: "production", apiMode: "direct" },
};

function parseHttpUrl(value: string, label: string): URL {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    return url;
  } catch {
    throw new Error(`${label} must be a valid HTTP or HTTPS URL.`);
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const expected = expectedProfileByMode[mode];
  const appEnvironment = env.VITE_APP_ENV?.trim() as AppEnvironment | undefined;
  const apiMode = env.VITE_API_MODE?.trim() as ApiMode | undefined;
  const apiBaseUrl = env.VITE_API_BASE_URL?.trim();
  const apiProxyTarget = env.API_PROXY_TARGET?.trim();
  const requestedPort = Number(env.VITE_DEV_PORT || 3001);
  const requestedPreviewPort = Number(env.VITE_PREVIEW_PORT || 4174);
  const port = Number.isFinite(requestedPort) ? requestedPort : 3001;
  const previewPort = Number.isFinite(requestedPreviewPort) ? requestedPreviewPort : 4174;

  if (!Number.isInteger(port) || port < 1024 || port > 65_535) {
    throw new Error("VITE_DEV_PORT must be an integer between 1024 and 65535.");
  }
  if (!Number.isInteger(previewPort) || previewPort < 1024 || previewPort > 65_535) {
    throw new Error("VITE_PREVIEW_PORT must be an integer between 1024 and 65535.");
  }

  if (!expected) throw new Error(`Unsupported Vite environment mode '${mode}'.`);
  if (appEnvironment !== expected.environment || apiMode !== expected.apiMode) {
    throw new Error(
      `Mode '${mode}' requires VITE_APP_ENV=${expected.environment} and VITE_API_MODE=${expected.apiMode}.`,
    );
  }
  if (!apiBaseUrl) throw new Error(`VITE_API_BASE_URL is required for ${mode}.`);

  const isRelativeApi = apiBaseUrl.startsWith("/");
  if (apiMode === "proxy") {
    if (!isRelativeApi || !apiProxyTarget) {
      throw new Error(`${mode} requires a same-origin API path and API_PROXY_TARGET.`);
    }
    const target = parseHttpUrl(apiProxyTarget, "API_PROXY_TARGET");
    if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(target.hostname)) {
      throw new Error(`${mode} uses a workstation proxy and must target a loopback API.`);
    }
  } else {
    if (isRelativeApi || apiProxyTarget) {
      throw new Error(`${mode} must call an absolute API URL without API_PROXY_TARGET.`);
    }
    const directApi = parseHttpUrl(apiBaseUrl, "VITE_API_BASE_URL");
    if (
      directApi.protocol !== "https:" ||
      ["localhost", "127.0.0.1", "::1", "[::1]"].includes(directApi.hostname)
    ) {
      throw new Error(`${mode} requires a non-local HTTPS API URL.`);
    }
  }

  const proxy: Record<string, string | ProxyOptions> | undefined =
    apiMode === "proxy" && apiProxyTarget
      ? {
          "/api": {
            target: apiProxyTarget,
            changeOrigin: true,
            secure: new URL(apiProxyTarget).protocol === "https:",
          },
        }
      : undefined;

  return {
    base: "/",
    server: {
      port,
      host: "127.0.0.1",
      strictPort: true,
      proxy,
    },
    preview: {
      port: previewPort,
      host: "127.0.0.1",
      strictPort: true,
      proxy,
    },
    plugins: [react()],
    build: {
      target: "es2022",
      cssCodeSplit: true,
      sourcemap: false,
    },
    resolve: {
      alias: { "@": path.resolve(__dirname, ".") },
    },
  };
});
