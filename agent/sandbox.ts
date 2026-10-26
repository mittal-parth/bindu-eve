import { agentBrowserRevalidationKey, installAgentBrowser } from "@agent-browser/eve/sandbox";
import { defineSandbox } from "eve/sandbox";
import { JustBashSandbox } from "eve/sandbox/just-bash";
import { VercelSandbox } from "eve/sandbox/vercel";

const browserRevision = agentBrowserRevalidationKey();
const localDev = process.env.EVE_DEV === "1" || process.env.EVE_EVALUATION === "1";

const justBash = JustBashSandbox.environment();
const vercel = VercelSandbox.environment({
  env: { AGENT_BROWSER_REVISION: browserRevision },
  prepare: async (sandbox) => {
    await installAgentBrowser(sandbox);
  },
  resources: { vcpus: 2 },
});

export const environment = localDev ? justBash : vercel;

export default defineSandbox(() =>
  localDev ? justBash.open() : vercel.open({ networkPolicy: "allow-all" }),
);
