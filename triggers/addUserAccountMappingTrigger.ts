import { Trigger } from "deno-slack-api/types.ts";
import { addUserAccountMappingWorkflow } from "../workflows/addUserAccountMappingWorkflow.ts";

const addUserAccountMappingTrigger: Trigger<
  typeof addUserAccountMappingWorkflow.definition
> = {
  type: "shortcut",
  name: "Add User Account Mapping",
  workflow: "#/workflows/addUserAccountMappingWorkflow",
  shortcut: {
    button_text: "Add Mapping",
  },
  inputs: {
    interactivity: { value: "{{data.interactivity}}" },
    slackAccount: { value: "{{data.user_id}}" },
  },
};

export default addUserAccountMappingTrigger;
