import { Manifest } from "deno-slack-sdk/mod.ts";
import defaultWorkflow from "./lib/workflow.ts";

export default Manifest({
  name: "Pull-Request Handler",
  description: "Handle Github Webhook PullRequestEvent",
  icon: "assets/icon.png",
  workflows: [defaultWorkflow],
  outgoingDomains: ["github.com"],
  botScopes: [
    "chat:write",
    "channels:history",
    "groups:history",
    "im:history",
    "mpim:history",
  ],
});
