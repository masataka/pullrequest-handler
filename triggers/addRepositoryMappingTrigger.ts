import { Trigger } from "deno-slack-api/types.ts";
import { addRepositoryMappingWorkflow } from "../workflows/addRepositoryMappingWorkflow.ts";

const addRepositoryMappingTrigger: Trigger<
  typeof addRepositoryMappingWorkflow.definition
> = {
  type: "shortcut",
  name: "addRepositoryMappingTrigger",
  workflow: "#/workflows/addRepositoryMappingWorkflow",
  inputs: {
    interactivity: { value: "{{data.interactivity}}" },
    slackChannel: { value: "{{data.channel_id}}" },
  },
};

export default addRepositoryMappingTrigger;
