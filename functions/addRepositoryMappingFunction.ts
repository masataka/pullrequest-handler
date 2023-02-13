import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import {
  renderRepositoryMappingForm,
  RepositoryMapping,
} from "./engine/forms.tsx";

export const addRepositoryMappingFunction = DefineFunction({
  callback_id: "addRepositoryMappingFunction",
  title: "Add Repository Mapping Function",
  source_file: "functions/addRepositoryMappingFunction.ts",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
      slackChannel: { type: Schema.slack.types.channel_id },
    },
    required: ["interactivity"],
  },
});

function createViewContext(
  // deno-lint-ignore no-explicit-any
  interactivity_pointer: any,
  view_id: string,
  items: RepositoryMapping[],
  slackChannel: string | undefined,
) {
  return {
    interactivity_pointer,
    view_id,
    view: {
      type: "modal",
      callback_id: "repositoryMapForm",
      title: { "type": "plain_text", "text": "Add Repository Mapping" },
      submit: { "type": "plain_text", "text": "Add New" },
      notify_on_close: true,
      blocks: renderRepositoryMappingForm({
        items,
        slackChannel,
      }),
    },
  };
}

export default SlackFunction(
  addRepositoryMappingFunction,
  async ({ inputs, client }) => {
    try {
      let result;
      result = await client.apps.datastore.query({
        datastore: "repositoryMap",
      });

      if (result.ok) {
        result = await client.views.open(createViewContext(
          inputs.interactivity.interactivity_pointer,
          "",
          result.items as RepositoryMapping[],
          inputs.slackChannel,
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
  async ({ client, action, body, inputs }) => {
    // delete one
    try {
      let result;
      result = await client.apps.datastore.delete({
        datastore: "repositoryMap",
        id: action.value,
      });

      const id: string | undefined = body.view?.id;
      if (result.ok && id) {
        result = await client.apps.datastore.query({
          datastore: "repositoryMap",
        });

        if (result.ok) {
          result = await client.views.update(createViewContext(
            null,
            id,
            result.items as RepositoryMapping[],
            inputs.slackChannel,
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
).addViewSubmissionHandler("repositoryMapForm", async ({ view, client }) => {
  // put new
  try {
    const owner = view.state.values.repositoryOwner.state.value;
    const name = view.state.values.repositoryName.state.value;
    const repositoryURL = `https://github.com/${owner}/${name}`;
    const branch = view.state.values.branch.state.value;
    const slackChannel = view.state.values.slackChannel.state.selected_channel;
    await client.apps.datastore.put({
      datastore: "repositoryMap",
      item: { repositoryURL, branch, slackChannel },
    });
  } catch (e) {
    return { error: `${e}` };
  }
});
