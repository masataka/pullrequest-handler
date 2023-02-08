import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";

export const handleWebhookFunction = DefineFunction({
  callback_id: "handleWebhook",
  title: "Handle Webhook",
  source_file: "functions/handleWebhookFunction.ts",
  input_parameters: {
    properties: {
      slackChannel: { type: Schema.types.string },
      contents: { type: Schema.types.object },
    },
    required: ["slackChannel", "contents"],
  },
});

export default SlackFunction(
  handleWebhookFunction,
  async ({ inputs, token }) => {
    const client = SlackAPI(token);
    await client.chat.postMessage({
      channel: inputs.slackChannel,
      text: JSON.stringify(inputs.contents),
    }).catch((e) => {
      console.error(e);
    });
    return { outputs: {} };
  },
);
