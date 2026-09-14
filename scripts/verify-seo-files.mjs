import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  loadSeoConfig,
  validateRobotsTxt,
  validateSitemapXml,
} from "./generate-seo-files.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readModeArgument(argv) {
  const inline = argv.find((value) => value.startsWith("--mode="));
  if (inline) return inline.slice("--mode=".length);
  const index = argv.indexOf("--mode");
  return index >= 0 ? argv[index + 1] : "production";
}

try {
  const mode = readModeArgument(process.argv.slice(2));
  const config = await loadSeoConfig(mode);
  const [sitemap, robots] = await Promise.all([
    readFile(path.join(projectRoot, "public/sitemap.xml"), "utf8"),
    readFile(path.join(projectRoot, "public/robots.txt"), "utf8"),
  ]);
  const sitemapResult = validateSitemapXml(sitemap, config.siteUrl);
  validateRobotsTxt(robots, config.siteUrl, config.aiCrawlerPolicy);
  console.log(
    `SEO files are valid for ${config.siteUrl}: ${sitemapResult.urlCount} canonical URLs; ${config.aiCrawlerPolicy} AI policy.`,
  );
} catch (error) {
  console.error(`SEO verification failed: ${error.message}`);
  process.exitCode = 1;
}
