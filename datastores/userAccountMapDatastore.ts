import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const userAccountMapDatastore = DefineDatastore({
  name: "userAccountMap",
  primary_key: "githubAccount",
  attributes: {
    githubAccount: { type: Schema.types.string },
    slackAccount: { type: Schema.types.string },
  },
});
