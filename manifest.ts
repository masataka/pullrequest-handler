import { Manifest } from "deno-slack-sdk/mod.ts";
import { repositoryMapDatastore } from "./datastores/repositoryMapDatastore.ts";
import { userAccountMapDatastore } from "./datastores/userAccountMapDatastore.ts";
import { notifyPullRequestWorkflow } from "./workflows/notifyPullRequestWorkflow.ts";
import { addRepositoryMappingWorkflow } from "./workflows/addRepositoryMappingWorkflow.ts";
import { addUserAccountMappingWorkflow } from "./workflows/addUserAccountMappingWorkflow.ts";

export default Manifest({
  name: "PullRequest Handler",
  description: "Notify a Slack channel of incoming Github pull request events",
  icon: "assets/icon.png",
  workflows: [
    notifyPullRequestWorkflow,
    addRepositoryMappingWorkflow,
    addUserAccountMappingWorkflow,
  ],
  outgoingDomains: [
    "api.github.com",
  ],
  datastores: [
    repositoryMapDatastore,
    userAccountMapDatastore,
  ],
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
