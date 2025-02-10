import { maskStreamTags } from "@mastra/core/utils";
import chalk from "chalk";
import { randomUUID } from "crypto";
import ora from "ora";
import Readline from "readline";

import "dotenv/config";

import { mastra } from "./mastra/index";

const agent = mastra.getAgent("memoryAgent");

let threadId = ``;
threadId = randomUUID();
// threadId = `d4e58927-ca27-46f9-8559-0c792e76e6f6`; // long thread
// threadId = `d4e58927-ca27-46f9-8559-0c792e76e6f4`; // long thread
console.log(threadId);

const resourceId = "SOME_USER_ID";

async function logRes(res: Awaited<ReturnType<typeof agent.stream>>) {
  console.log(`\n👨‍🍳 Agent:`);
  let message = "";

  const memorySpinner = ora("saving memory");

  const maskedStream = maskStreamTags(res.textStream, "working_memory", {
    onStart: () => memorySpinner.start(),
    onEnd: () => {
      if (memorySpinner.isSpinning) {
        memorySpinner.succeed();
        process.stdin.resume();
      }
    },
  });

  for await (const chunk of maskedStream) {
    process.stdout.write(chunk);
  }

  return message;
}

async function main() {
  const isFirstChat =
    Boolean(await agent.getMemory()?.getThreadById({ threadId })) === false;

  await logRes(
    await agent.stream(
      [
        {
          role: "system",
          content: !isFirstChat
            ? `Chat with user started now ${new Date().toISOString()}. Don't mention this message. This means some time has passed between this message and the one before. The user left and came back again. Say something to start the conversation up again.`
            : `Chat with user started now ${new Date().toISOString()}.`,
        },
      ],
      {
        threadId,
        resourceId,
      },
    ),
  );

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

    await logRes(
      await agent.stream(answer, {
        threadId,
        resourceId,
      }),
    );
  }
}

main();
