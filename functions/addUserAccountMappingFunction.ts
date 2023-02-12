import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  renderUserAccountMappingForm,
  UserAccountMapping,
} from "./engine/forms.tsx";

export const addUserAccountMappingFunction = DefineFunction({
  callback_id: "addUserAccountMappingFunction",
  title: "Add User Account Mapping Function",
  source_file: "functions/addUserAccountMappingFunction.ts",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
      slackAccount: { type: Schema.types.string },
    },
    required: ["interactivity"],
  },
});

function createViewContext(
  // deno-lint-ignore no-explicit-any
  interactivity_pointer: any,
  items: UserAccountMapping[],
  slackAccount: string | undefined,
) {
  return {
    interactivity_pointer,
    external_id: "userAccountMapForm",
    view: {
      type: "modal",
      callback_id: "userAccountMapForm",
      external_id: "userAccountMapForm",
      title: { "type": "plain_text", "text": "Add User-Account Mapping" },
      submit: { "type": "plain_text", "text": "Add New" },
      notify_on_close: true,
      blocks: renderUserAccountMappingForm({
        items,
        slackAccount,
      }),
    },
  };
}

export default SlackFunction(
  addUserAccountMappingFunction,
  async ({ inputs, client }) => {
    try {
      let result;
      result = await client.apps.datastore.query({
        datastore: "userAccountMap",
      });

      if (result.ok) {
        result = await client.views.open(createViewContext(
          inputs.interactivity.interactivity_pointer,
          result.items as UserAccountMapping[],
          inputs.slackAccount,
        ));

        if (result.ok) {
          return { completed: false };
        }
      }
      return { error: JSON.stringify(result) };
    } catch (e) {
      return { error: `${e}` };
    }
  },
).addBlockActionsHandler(
  ["deleteMapping"],
  async ({ client, action, inputs }) => {
    // delete one
    try {
      let result;
      result = await client.apps.datastore.delete({
        datastore: "userAccountMap",
        id: action.value,
      });

      if (result.ok) {
        result = await client.apps.datastore.query({
          datastore: "userAccountMap",
        });

        if (result.ok) {
          result = await client.views.update(createViewContext(
            null,
            result.items as UserAccountMapping[],
            inputs.slackAccount,
          ));
        }
      }

      if (result.error) {
        return { error: JSON.stringify(result) };
      }
    } catch (e) {
      return { error: `${e}` };
    }
  },
).addViewSubmissionHandler("userAccountMapForm", async ({ view, client }) => {
  // put new
  console.log({ view_state_values: view.state.values });
  try {
    const githubAccount = view.state.values.githubAccount.state.value;
    const slackAccount = view.state.values.slackAccount.state.selected_user;
    await client.apps.datastore.put({
      datastore: "userAccountMap",
      item: { githubAccount, slackAccount },
    });
  } catch (e) {
    return { error: `${e}` };
  }
});
