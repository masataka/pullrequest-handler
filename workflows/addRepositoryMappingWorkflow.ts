import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { addRepositoryMappingFunction } from "../functions/addRepositoryMappingFunction.ts";

export const addRepositoryMappingWorkflow = DefineWorkflow({
  callback_id: "addRepositoryMappingWorkflow",
  title: "Add Repository Mapping Workflow",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
      slackChannel: { type: Schema.slack.types.channel_id },
    },
    required: ["interactivity"],
  },
});

const inputForm = addRepositoryMappingWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Add Repository Mapping",
    interactivity: addRepositoryMappingWorkflow.inputs.interactivity,
    submit_label: "Save",
    fields: {
      elements: [
        {
          name: "repositoryURL",
          title: "Target repository URL of GitHub",
          type: Schema.types.string,
        },
        {
          name: "branch",
          title: "Target branch",
          type: Schema.types.string,
        },
        {
          name: "slackChannel",
          title: "Channel to send message to",
          type: Schema.slack.types.channel_id,
          default: addRepositoryMappingWorkflow.inputs.slackChannel,
        },
      ],
      required: ["repositoryURL", "branch", "slackChannel"],
    },
  },
);

addRepositoryMappingWorkflow.addStep(addRepositoryMappingFunction, {
  repositoryURL: inputForm.outputs.fields.repositoryURL,
  branch: inputForm.outputs.fields.branch,
  slackChannel: inputForm.outputs.fields.slackChannel,
});
