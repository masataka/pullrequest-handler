import { Trigger } from "deno-slack-api/types.ts";
import { notifyPullRequest } from "../workflows/notifyPullRequest.ts";

const githubWebhookTrigger: Trigger<typeof notifyPullRequest.definition> = {
  type: "webhook",
  name: "githubWebhookTrigger",
  workflow: "#/workflows/notifyPullRequest",
  inputs: {
    payload: { value: "{{data}}" },
  },
};

export default githubWebhookTrigger;
