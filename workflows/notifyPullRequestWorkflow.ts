import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { createContextFunction } from "../functions/createContextFunction.ts";
import { handleWebhookFunction } from "../functions/handleWebhookFunction.ts";

export const notifyPullRequestWorkflow = DefineWorkflow({
  callback_id: "notifyPullRequestWorkflow",
  title: "Notify PullRequest",
  input_parameters: {
    properties: {
      payload: { type: Schema.types.object },
    },
    required: ["payload"],
  },
});

const step1 = notifyPullRequestWorkflow.addStep(createContextFunction, {
  payload: notifyPullRequestWorkflow.inputs.payload,
});

notifyPullRequestWorkflow.addStep(handleWebhookFunction, {
  webhookContext: step1.outputs.webhookContext,
  githubToken: step1.outputs.githubToken,
  slackChannel: step1.outputs.slackChannel,
  userMap: step1.outputs.userMap,
});
