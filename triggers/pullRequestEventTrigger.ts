import { Trigger } from "deno-slack-api/types.ts";
import { notifyPullRequestWorkflow } from "../workflows/notifyPullRequestWorkflow.ts";

const pullRequestEventTrigger: Trigger<
  typeof notifyPullRequestWorkflow.definition
> = {
  type: "webhook",
  name: "pullRequestEvent",
  workflow: "#/workflows/notifyPullRequestWorkflow",
  inputs: {
    payload: { value: "{{data}}" },
  },
};

export default pullRequestEventTrigger;
