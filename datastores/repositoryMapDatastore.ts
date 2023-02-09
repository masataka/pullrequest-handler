import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const repositoryMapDatastore = DefineDatastore({
  name: "repositoryMap",
  primary_key: "repositoryURL",
  attributes: {
    repositoryURL: { type: Schema.types.string },
    branch: { type: Schema.types.string },
    slackChannel: { type: Schema.types.string },
  },
});
