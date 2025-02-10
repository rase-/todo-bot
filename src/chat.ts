import { maskStreamTags } from "@mastra/core/utils";
import chalk from "chalk";
import { randomUUID } from "crypto";
import ora from "ora";
import Readline from "readline";

import "dotenv/config";

import { mastra } from "./mastra/index";

const agent = mastra.getAgent("memoryAgent");

let threadId = randomUUID();
const resourceId = "SOME_USER_ID";

async function main() {
  const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    process.stdout.write(`\n\n`);
    const answer: string = await new Promise((res) => {
      rl.question(chalk.grey("\n> "), (answer) => {
        setImmediate(() => res(answer));
      });
    });

    const { textStream } = await agent.stream(answer, {
      threadId,
      resourceId,
    });

    for await (const chunk of maskStreamTags(textStream, "working_memory")) {
      process.stdout.write(chunk);
    }
  }
}

main();
