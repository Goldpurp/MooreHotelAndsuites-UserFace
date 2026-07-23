import { spawn } from "node:child_process";
import readline from "node:readline";

const child = spawn("yarn", ["audit", "--json"], {
  stdio: ["ignore", "pipe", "inherit"],
});

let summary;
const remaining = new Map();
const lines = readline.createInterface({ input: child.stdout });
for await (const line of lines) {
  try {
    const item = JSON.parse(line);
    if (item.type === "auditSummary") {
      summary = item.data?.vulnerabilities;
    } else if (item.type === "auditAdvisory") {
      const advisory = item.data?.advisory;
      if (advisory?.module_name && advisory?.severity) {
        remaining.set(
          `${advisory.module_name}:${advisory.severity}`,
          `${advisory.module_name} (${advisory.severity})`,
        );
      }
    }
  } catch {
    // Yarn warnings are not always JSON. The missing-summary check below
    // distinguishes those warnings from a failed advisory query.
  }
}

await new Promise((resolve) => child.once("close", resolve));

if (!summary) {
  console.error("The dependency advisory service did not return an audit summary.");
  process.exitCode = 1;
} else {
  const high = Number(summary.high || 0);
  const critical = Number(summary.critical || 0);
  console.log(
    `Dependency audit: ${critical} critical, ${high} high, ` +
      `${Number(summary.moderate || 0)} moderate, ${Number(summary.low || 0)} low.`,
  );
  if (remaining.size > 0) {
    console.log(`Remaining advisories: ${[...remaining.values()].join(", ")}.`);
  }
  if (critical + high > 0) {
    process.exitCode = 1;
  }
}
