import { Manifest } from "deno-slack-sdk/mod.ts";
import workflow from "./lib/workflow.ts";
import handler from "./lib/handler/definition.ts";

export default Manifest({
  name: "Pull-Request Handler",
  description: "Handle Github Webhook PullRequestEvent",
  icon: "assets/icon.png",
  functions: [handler],
  workflows: [workflow],
  outgoingDomains: ["github.com"],
  botScopes: [
    "chat:write",
    "channels:history",
    "groups:history",
    "im:history",
    "mpim:history",
  ],
});
