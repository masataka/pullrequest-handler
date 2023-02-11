import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { notifyPullRequestFunction } from "../functions/notifyPullRequestFunction.ts";

export const notifyPullRequestWorkflow = DefineWorkflow({
  callback_id: "notifyPullRequestWorkflow",
  title: "Notify PullRequest Workflow",
  input_parameters: {
    properties: {
      payload: { type: Schema.types.object },
    },
    required: ["payload"],
  },
});

notifyPullRequestWorkflow.addStep(notifyPullRequestFunction, {
  payload: notifyPullRequestWorkflow.inputs.payload,
});
