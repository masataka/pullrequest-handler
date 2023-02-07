import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { createContextFunction } from "../functions/createContextFunction.ts";
import { getActualGraphFunction } from "../functions/getActualGraphFunction.ts";
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

const step2 = notifyPullRequestWorkflow.addStep(getActualGraphFunction, {
  owner: step1.outputs.webhookContext?.repository.owner.login,
  name: step1.outputs.webhookContext?.repository.name,
  pullRequestNumber: step1.outputs.webhookContext?.pullRequestNumber,
  githubToken: step1.outputs.githubToken,
});

notifyPullRequestWorkflow.addStep(handleWebhookFunction, {
  slackChannel: step1.outputs.slackChannel,
  contents: step2.outputs.actualGraph,
});
