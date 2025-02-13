import { Mastra } from "@mastra/core/mastra";
import { Memory } from "@mastra/memory";
import { createLogger } from "@mastra/core/logger";

import { memoryAgent } from "./agents";

export const mastra = new Mastra({
  agents: { memoryAgent },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),

  memory: new Memory(),
});
