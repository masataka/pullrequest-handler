import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
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

notifyPullRequestWorkflow.addStep(handleWebhookFunction, {
  payload: notifyPullRequestWorkflow.inputs.payload,
});
