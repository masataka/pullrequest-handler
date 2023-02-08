import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

export const GithubName = DefineType({
  name: "githubName",
  type: Schema.types.object,
  properties: {
    login: { type: Schema.types.string },
    url: { type: Schema.types.string },
  },
});

export const GithubRepository = DefineType({
  name: "githubRepository",
  type: Schema.types.object,
  properties: {
    owner: { type: GithubName },
    name: { type: Schema.types.string },
    url: { type: Schema.types.string },
  },
});

export const WebhookContext = DefineType({
  name: "webhook",
  type: Schema.types.object,
  properties: {
    sender: { type: GithubName },
    event: { type: Schema.types.string },
    action: { type: Schema.types.string },
    repository: { type: GithubRepository },
    pullRequestNumber: { type: Schema.types.number },
  },
});
