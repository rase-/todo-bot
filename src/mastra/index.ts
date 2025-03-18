import { Mastra } from "@mastra/core/mastra";
import { DefaultStorage } from "@mastra/core/storage/libsql";
import { DefaultVectorDB } from "@mastra/core/vector/libsql";
import { Memory } from "@mastra/memory";
import { createLogger } from "@mastra/core/logger";

import { memoryAgent } from "./agents";

const storage = new DefaultStorage({
  config: {
    url: "libsql://c01c3455-3745-4087-a75b-44721ed68b19-mastra.turso.io",
    authToken:
      "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Mzk4MTAwNzAsInAiOnsicnciOnsibnMiOlsiMWIyZjYyMTgtOTI1MS00ZDk3LWIzMDctNzBkMTk3OGIyMjJmIl19fX0.0FqTfjNGPMGk9-Da_0-2cpS8B71uoyMmWnHriQg6ygFJvNNvCgZkKQYJIcrUWG32Df137sf1Knt2qU7uMBj0Bw",
  },
});
await storage.init();

const vector = new DefaultVectorDB({
  connectionUrl:
    "libsql://c01c3455-3745-4087-a75b-44721ed68b19-mastra.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Mzk4MTAwNzAsInAiOnsicnciOnsibnMiOlsiMWIyZjYyMTgtOTI1MS00ZDk3LWIzMDctNzBkMTk3OGIyMjJmIl19fX0.0FqTfjNGPMGk9-Da_0-2cpS8B71uoyMmWnHriQg6ygFJvNNvCgZkKQYJIcrUWG32Df137sf1Knt2qU7uMBj0Bw",
});

// const storage = new DefaultStorage({
//   config: {
//     url: "file:test.db",
//   },
// });

// const vector = new DefaultVectorDB({
//   connectionUrl: "file:test.db",
// });

export const memory = new Memory({ storage, vector });

export const mastra = new Mastra({
  agents: { memoryAgent },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),

  memory,
});
