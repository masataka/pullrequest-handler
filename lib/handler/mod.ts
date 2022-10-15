import { SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import definition from "./definition.ts";
import type { PullRequestEvent } from "https://esm.sh/@octokit/webhooks-types@5.8.0/schema.d.ts";

export default SlackFunction(
  definition,
  async ({ inputs, env, token }) => {
    const client = SlackAPI(token);
    const payload = inputs.payload as PullRequestEvent;
    await client.chat.postMessage({
      channel: env["slackChannel"],
      text: `${payload.action}: PR#${payload.pull_request.number}`,
    });
    return { outputs: {} };
  },
);
