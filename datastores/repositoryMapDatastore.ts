import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const repositoryMapDatastore = DefineDatastore({
  name: "repositoryMap",
  primary_key: "githubRepository",
  attributes: {
    githubRepository: { type: Schema.types.string },
    slackChannel: { type: Schema.types.string },
  },
});
