import { defineEval } from "eve/evals";
import { equals, satisfies } from "eve/evals/expect";

const browserTools = ["browser__navigate", "browser__click", "browser__screenshot"] as const;
const additionalTools = ["ask_question", "grep"] as const;

interface AgentInfo {
  memories: { slot: string }[];
  sandbox: { logicalPath: string };
  tools: { static: { name: string }[] };
}

export default defineEval({
  description: "The file memory slot, browser tools, ask_question, grep, and sandbox are part of the compiled agent.",
  tags: ["fast"],
  async test(t) {
    const response = await t.target.fetch("/eve/v1/info");
    await t.require(response.status, equals(200));

    const info = (await response.json()) as AgentInfo;
    const toolNames = info.tools.static.map((tool) => tool.name);

    t.check(
      info.memories.map((memory) => memory.slot),
      satisfies((slots: string[]) => slots.includes("file"), "file memory slot"),
    );
    t.check(info.sandbox.logicalPath, equals("sandbox.ts"));
    for (const name of [...browserTools, ...additionalTools]) {
      t.check(
        toolNames,
        satisfies((names: string[]) => names.includes(name), name),
      );
    }
  },
});
