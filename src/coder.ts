import { maskStreamTags } from "@mastra/core/utils";
import chalk from "chalk";
import { randomUUID } from "crypto";
import ora from "ora";
import Readline from "readline";

import "dotenv/config";

import { mastra } from "./mastra/index";

const agent = mastra.getAgent("sysAdminAgent");

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

    const { text } = await agent.generate(answer, {
      threadId,
      resourceId,
    });
    console.log(text);
    // console.log(`stream:`);
    // const { textStream } = await agent.stream(answer, {
    //   threadId,
    //   resourceId,
    // });
    //
    // console.log(`end stream:`);
    // for await (const chunk of textStream) {
    //   process.stdout.write(chunk);
    // }
    // console.log(`write`);
  }
}

main();
