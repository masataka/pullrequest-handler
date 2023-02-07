import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const userMapDatastore = DefineDatastore({
  name: "userMap",
  primary_key: "githubAcount",
  attributes: {
    githubAcount: { type: Schema.types.string },
    slackAcount: { type: Schema.types.string },
  },
});
