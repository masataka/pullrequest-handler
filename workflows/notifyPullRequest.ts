import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { LoadRepoMap } from "../functions/loadRepoMap.ts";
import { handleWebhook } from "../functions/handleWebhook.ts";

export const notifyPullRequest = DefineWorkflow({
  callback_id: "notifyPullRequest",
  title: "notifyPullRequest",
  input_parameters: {
    properties: {
      repos: {
        type: Schema.types.object,
      },
      payload: {
        type: Schema.types.object,
      },
    },
    required: ["payload"],
  },
});

const loaded = notifyPullRequest.addStep(LoadRepoMap, {});

notifyPullRequest.addStep(handleWebhook, {
  repos: loaded.outputs.repos,
  payload: notifyPullRequest.inputs.payload,
});
