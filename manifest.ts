import { Manifest } from "deno-slack-sdk/mod.ts";
import { notifyPullRequest } from "./workflows/notifyPullRequest.ts";

export default Manifest({
  name: "Pull-Request Handler",
  description: "Handle Github Webhook PullRequestEvent",
  icon: "assets/icon.png",
  workflows: [notifyPullRequest],
  outgoingDomains: ["github.com"],
  botScopes: [
    "chat:write",
    "channels:history",
    "groups:history",
    "im:history",
    "mpim:history",
  ],
});
