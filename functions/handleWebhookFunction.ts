import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import type { PullRequestEvent } from "https://esm.sh/@octokit/webhooks-types@6.10.0/schema.d.ts";

export const handleWebhookFunction = DefineFunction({
  callback_id: "handleWebhook",
  title: "Handle Webhook",
  source_file: "functions/handleWebhookFunction.ts",
  input_parameters: {
    properties: {
      payload: { type: Schema.types.object },
    },
    required: ["payload"],
  },
});

export default SlackFunction(
  handleWebhookFunction,
  async ({ inputs, env, token }) => {
    const client = SlackAPI(token);
    const payload = inputs.payload as PullRequestEvent;
    const text = `${payload.action}: PR#${payload.pull_request.number}`;
    console.log(text);
    const channel = env["slackChannel"];
    console.log(channel);
    await client.chat.postMessage({ channel, text }).catch((e) => {
      console.error(e);
    }).then((result) => {
      console.log(result);
    });
    return { outputs: {} };
  },
);
