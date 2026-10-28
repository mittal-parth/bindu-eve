import { agentBrowserRevalidationKey, installAgentBrowser } from "@agent-browser/eve/sandbox";
import { defineSandbox } from "eve/sandbox";
import { JustBashSandbox } from "eve/sandbox/just-bash";
import { VercelSandbox } from "eve/sandbox/vercel";

const browserRevision = agentBrowserRevalidationKey();
const localDev = process.env.EVE_DEV === "1" || process.env.EVE_EVALUATION === "1";

// Just-bash is removed from the hosted bundle. Constructing it on Vercel throws
// at import time, before the localDev branch can discard it.
const justBash = localDev ? JustBashSandbox.environment() : undefined;
const vercel = localDev
  ? undefined
  : VercelSandbox.environment({
      env: { AGENT_BROWSER_REVISION: browserRevision },
      prepare: async (sandbox) => {
        await installAgentBrowser(sandbox);
      },
      resources: { vcpus: 2 },
    });

export const environment = localDev ? justBash : vercel;

export default defineSandbox(() => {
  if (justBash) return justBash.open();
  if (vercel) return vercel.open({ networkPolicy: "allow-all" });
  throw new Error("Sandbox environment was not configured.");
});
