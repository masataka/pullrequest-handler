import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { addUserAccountMappingFunction } from "../functions/addUserAccountMappingFunction.ts";

export const addUserAccountMappingWorkflow = DefineWorkflow({
  callback_id: "addUserAccountMappingWorkflow",
  title: "Add User Account Mapping Workflow",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
      slackAccount: { type: Schema.slack.types.user_id },
    },
    required: ["interactivity"],
  },
});

addUserAccountMappingWorkflow.addStep(addUserAccountMappingFunction, {
  interactivity: addUserAccountMappingWorkflow.inputs.interactivity,
  slackAccount: addUserAccountMappingWorkflow.inputs.slackAccount,
});
