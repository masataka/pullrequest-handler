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

addRepositoryMappingWorkflow.addStep(addRepositoryMappingFunction, {
  interactivity: addRepositoryMappingWorkflow.inputs.interactivity,
  slackChannel: addRepositoryMappingWorkflow.inputs.slackChannel,
});
