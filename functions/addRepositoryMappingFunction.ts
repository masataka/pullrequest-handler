import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const addRepositoryMappingFunction = DefineFunction({
  callback_id: "addRepositoryMappingFunction",
  title: "Add Repository Mapping Function",
  source_file: "functions/addRepositoryMappingFunction.ts",
  input_parameters: {
    properties: {
      repositoryURL: { type: Schema.types.string },
      branch: { type: Schema.types.string },
      slackChannel: { type: Schema.types.string },
    },
    required: ["repositoryURL", "branch", "slackChannel"],
  },
});

export default SlackFunction(
  addRepositoryMappingFunction,
  async ({ inputs, client }) => {
    try {
      await client.apps.datastore.put({
        datastore: "repositoryMap",
        item: inputs,
      });
    } catch (e) {
      return { error: `${e}` };
    }
    return { outputs: {} };
  },
);
