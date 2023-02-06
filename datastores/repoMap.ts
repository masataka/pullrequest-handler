import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

export const repoMap = DefineDatastore({
  name: "repoMap",
  primary_key: "github",
  attributes: {
    github: { type: Schema.types.string },
    slack: { type: Schema.types.string },
  },
});
