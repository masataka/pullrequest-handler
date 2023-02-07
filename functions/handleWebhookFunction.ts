import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";

import { Webhook } from "./customTypes.ts";

export const handleWebhookFunction = DefineFunction({
  callback_id: "handleWebhook",
  title: "Handle Webhook",
  source_file: "functions/handleWebhookFunction.ts",
  input_parameters: {
    properties: {
      webhookContext: { type: Webhook },
      githubToken: { type: Schema.types.string },
      slackChannel: { type: Schema.types.string },
      userMap: { type: Schema.types.object },
    },
    required: [],
  },
});

export default SlackFunction(
  handleWebhookFunction,
  async ({ inputs, env, token }) => {
    const client = SlackAPI(token);
    const channel = inputs.slackChannel || env["slackChannel"];
    const text = JSON.stringify(inputs.webhookContext);
    await client.chat.postMessage({ channel, text }).catch((e) => {
      console.error(e);
    });
    return { outputs: {} };
  },
);
