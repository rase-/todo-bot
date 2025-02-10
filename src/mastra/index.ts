import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";

import { memoryAgent, sysAdminAgent } from "./agents";

export const mastra = new Mastra({
  agents: { memoryAgent, sysAdminAgent },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});
