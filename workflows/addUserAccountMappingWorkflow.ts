import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { addUserAccountMappingFunction } from "../functions/addUserAccountMappingFunction.ts";

export const addUserAccountMappingWorkflow = DefineWorkflow({
  callback_id: "addUserAccountMappingWorkflow",
  title: "Add User Account Mapping Workflow",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
    },
    required: ["interactivity"],
  },
});

const inputForm = addUserAccountMappingWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "User Account Mapping",
    interactivity: addUserAccountMappingWorkflow.inputs.interactivity,
    submit_label: "Save",
    fields: {
      elements: [
        {
          name: "githubAccount",
          title: "GitHub Account",
          type: Schema.types.string,
        },
        {
          name: "slackAccount",
          title: "Slack Account",
          type: Schema.slack.types.user_id,
        },
      ],
      required: ["githubAccount", "slackAccount"],
    },
  },
);

addUserAccountMappingWorkflow.addStep(addUserAccountMappingFunction, {
  githubAccount: inputForm.outputs.fields.githubAccount,
  slackAccount: inputForm.outputs.fields.slackAccount,
});
