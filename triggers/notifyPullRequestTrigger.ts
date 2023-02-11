import { Trigger } from "deno-slack-api/types.ts";
import { notifyPullRequestWorkflow } from "../workflows/notifyPullRequestWorkflow.ts";

const notifyPullRequestTrigger: Trigger<
  typeof notifyPullRequestWorkflow.definition
> = {
  type: "webhook",
  name: "notifyPullRequestTrigger",
  workflow: "#/workflows/notifyPullRequestWorkflow",
  inputs: {
    payload: { value: "{{data}}" },
  },
};

export default notifyPullRequestTrigger;
