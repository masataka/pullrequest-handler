import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

export const LoadRepoMap = DefineFunction({
  callback_id: "loadRepoMap",
  title: "loadRepoMap",
  source_file: "functions/loadRepoMap.ts",
  output_parameters: {
    properties: {
      repos: {
        type: Schema.types.object,
      },
    },
    required: ["repos"],
  },
});
