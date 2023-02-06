import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { handleWebhook } from "../functions/handleWebhook.ts";

export const notifyPullRequest = DefineWorkflow({
  callback_id: "notifyPullRequest",
  title: "notifyPullRequest",
  input_parameters: {
    properties: {
      payload: { type: Schema.types.object },
    },
    required: ["payload"],
  },
});

notifyPullRequest.addStep(handleWebhook, {
  payload: notifyPullRequest.inputs.payload,
});
