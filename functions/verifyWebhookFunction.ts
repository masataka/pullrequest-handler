import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import type { PullRequestEvent } from "https://esm.sh/@octokit/webhooks-types@6.10.0/schema.d.ts";

export const verifyWebhookFunction = DefineFunction({
  callback_id: "verifyWebhook",
  title: "Verify Webhook",
  source_file: "functions/verifyWebhookFunction.ts",
  input_parameters: {
    properties: {
      payload: { type: Schema.types.object },
    },
    required: ["payload"],
  },
  output_parameters: {
    properties: {
      ok: { type: Schema.types.boolean },
    },
    required: ["ok"],
  },
});

export default SlackFunction(
  verifyWebhookFunction,
  ({ inputs }) => {
    const payload = inputs.payload as PullRequestEvent;
    const { sender, action, repository, pull_request } = payload;
    const ok = sender !== undefined && action !== undefined &&
      repository !== undefined && pull_request !== undefined;
    return { outputs: { ok } };
  },
);
