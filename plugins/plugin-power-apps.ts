import type { Plugin, ViteDevServer } from "vite";
import pc from "picocolors";
import powerConfig from "../power.config.json";

const powerConfigPath = "/power.config.json";

export const powerAppsCorsOrigins = [
  // vite default localhost origins
  /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/,
  // apps.powerapps.com
  /^https:\/\/apps\.powerapps\.com$/,
  // apps.*.powerapps.com
  /^https:\/\/apps\.(?:[^.]+\.)*powerapps\.com$/,
];

export function powerApps(): Plugin {
  return {
    name: "powerapps",
    apply: "serve", // dev-only
    configureServer(server: ViteDevServer) {
      printPlayUrl(server);
      servePowerConfig(server);
    },
  };
}

// Prints the Power Apps play URL to the console when the server starts listening
function printPlayUrl(server: ViteDevServer): void {
  server.httpServer?.once("listening", () => {
    const environmentId = powerConfig?.environmentId;
    if (!environmentId) {
      return;
    }

    const urls = server.resolvedUrls?.local ?? [];
    const baseUrl = urls[0];
    if (!baseUrl) {
      return;
    }

    // NOTE: we should be URL-encoding these parameters, but Power Apps expects them unencoded
    const localAppUrl = `${baseUrl}`;
    const localConnectionUrl = `${baseUrl.replace(/\/$/, "")}${powerConfigPath}`;

    const playUrl =
      `${pc.magenta("https://apps.powerapps.com/play/e/") + pc.magentaBright(environmentId) + pc.magenta("/a/local")}` +
      `${pc.magenta("?_localAppUrl=") + pc.magentaBright(localAppUrl)}` +
      `${pc.magenta("&_localConnectionUrl=") + pc.magentaBright(localConnectionUrl)}`;

    server.config.logger.info(`  ${pc.magenta("➜")}  Local Play:   ${playUrl}`);
  });
}

// Serves the power.config.json content at a specific path to be accessed by apps.powerapps.com
function servePowerConfig(server: ViteDevServer) {
  server.middlewares.use(`${powerConfigPath}`, (_req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(powerConfig));
  });
}
