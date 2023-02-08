import { Manifest } from "deno-slack-sdk/mod.ts";
import {
  GithubName,
  GithubRepository,
  WebhookContext,
} from "./functions/customTypes.ts";
import { repositoryMapDatastore } from "./datastores/repositoryMapDatastore.ts";
import { userMapDatastore } from "./datastores/userMapDatastore.ts";
import { notifyPullRequestWorkflow } from "./workflows/notifyPullRequestWorkflow.ts";

export default Manifest({
  name: "PullRequest Handler",
  description: "Notify a Slack channel of incoming Github pull request events",
  icon: "assets/icon.png",
  types: [GithubName, GithubRepository, WebhookContext],
  workflows: [notifyPullRequestWorkflow],
  outgoingDomains: ["api.github.com", "esm.sh"],
  datastores: [repositoryMapDatastore, userMapDatastore],
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
