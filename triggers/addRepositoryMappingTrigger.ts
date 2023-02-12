import { Trigger } from "deno-slack-api/types.ts";
import { addRepositoryMappingWorkflow } from "../workflows/addRepositoryMappingWorkflow.ts";

const addRepositoryMappingTrigger: Trigger<
  typeof addRepositoryMappingWorkflow.definition
> = {
  type: "shortcut",
  name: "Add Repository Mapping",
  workflow: "#/workflows/addRepositoryMappingWorkflow",
  shortcut: {
    button_text: "Add Mapping",
  },
  inputs: {
    interactivity: { value: "{{data.interactivity}}" },
    slackChannel: { value: "{{data.channel_id}}" },
  },
};

export default addRepositoryMappingTrigger;
