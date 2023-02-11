import { Trigger } from "deno-slack-api/types.ts";
import { addUserAccountMappingWorkflow } from "../workflows/addUserAccountMappingWorkflow.ts";

const addUserAccountMappingTrigger: Trigger<
  typeof addUserAccountMappingWorkflow.definition
> = {
  type: "shortcut",
  name: "addUserAccountMappingTrigger",
  workflow: "#/workflows/addUserAccountMappingWorkflow",
  inputs: {
    interactivity: { value: "{{data.interactivity}}" },
  },
};

export default addUserAccountMappingTrigger;
