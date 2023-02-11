import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const addUserAccountMappingFunction = DefineFunction({
  callback_id: "addUserAccountMappingFunction",
  title: "Add User Account Mapping Function",
  source_file: "functions/addUserAccountMappingFunction.ts",
  input_parameters: {
    properties: {
      githubAccount: { type: Schema.types.string },
      slackAccount: { type: Schema.types.string },
    },
    required: ["githubAccount", "slackAccount"],
  },
});

export default SlackFunction(
  addUserAccountMappingFunction,
  async ({ inputs, client }) => {
    try {
      await client.apps.datastore.put({
        datastore: "userAccountMap",
        item: inputs,
      });
    } catch (e) {
      return { error: `${e}` };
    }
    return { outputs: {} };
  },
);
