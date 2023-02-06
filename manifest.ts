import { Manifest } from "deno-slack-sdk/mod.ts";
import { repoMap } from "./datastores/repoMap.ts";
import { userMap } from "./datastores/userMap.ts";
import { notifyPullRequest } from "./workflows/notifyPullRequest.ts";

export default Manifest({
  name: "PullRequest Handler",
  description: "Notify a Slack channel of incoming Github pull request events",
  icon: "assets/icon.png",
  workflows: [notifyPullRequest],
  outgoingDomains: ["github.com"],
  datastores: [repoMap, userMap],
  botScopes: [
    "chat:write",
    "channels:history",
    "groups:history",
    "im:history",
    "mpim:history",
    "datastore:read",
    "datastore:write",
  ],
});
