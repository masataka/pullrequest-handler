import { Trigger } from "deno-slack-api/types.ts";
import defaultWorkflow from "./workflow.ts";

const trigger: Trigger<typeof defaultWorkflow.definition> = {
  type: "webhook",
  name: "handle-webhook",
  workflow: "#/workflows/default-workflow",
  inputs: {
    payload: {
      value: "{{data}}",
    },
  },
};

export default trigger;
