import { DefineType, Schema } from "deno-slack-sdk/mod.ts";
export const GitHubUserType = DefineType({
  name: "GitHubUser",
  type: Schema.types.object,
  properties: {
    login: { type: Schema.types.string },
    url: { type: Schema.types.string },
  },
});

export const GitHubRepositoryType = DefineType({
  name: "GitHubRepository",
  type: Schema.types.object,
  properties: {
    owner: { type: GitHubUserType },
    name: { type: Schema.types.string },
    url: { type: Schema.types.string },
  },
});

export const WebhookContextType = DefineType({
  name: "Webhook",
  type: Schema.types.object,
  properties: {
    sender: { type: GitHubUserType },
    event: { type: Schema.types.string },
    action: { type: Schema.types.string },
    repository: { type: GitHubRepositoryType },
    pullRequestNumber: { type: Schema.types.number },
    //requestedReviewer
    //review
  },
});
