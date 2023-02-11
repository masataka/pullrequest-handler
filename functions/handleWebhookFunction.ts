import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import createContext from "./engine/createContext.ts";
import postNotification from "./engine/postNotification.ts";

export const handleWebhookFunction = DefineFunction({
  callback_id: "handleWebhook",
  title: "Handle Webhook",
  source_file: "functions/handleWebhookFunction.ts",
  input_parameters: {
    properties: {
      payload: { type: Schema.types.object },
    },
    required: ["payload"],
  },
});

export default SlackFunction(
  handleWebhookFunction,
  async ({ inputs, client, env, token }) => {
    try {
      // payload -> context
      const webhookContext = createContext(inputs.payload);
      if (webhookContext === null) {
        return { outputs: {} };
      }

      // settings
      const r1 = await client.apps.datastore.get({
        datastore: "repositoryMap",
        id: webhookContext.repository.url,
      });
      let branch;
      let slackChannel;
      if (r1.ok) {
        branch = r1.item["branch"];
        slackChannel = r1.item["slackChannel"];
      }

      const githubToken = env["githubToken"];
      console.log({ branch, slackChannel, githubToken });

      if (webhookContext.baseRef !== branch) {
        return { outputs: {} };
      }

      const r2 = await client.apps.datastore.query({
        datastore: "userMap",
      });
      let userMap = {};
      if (r2.ok) {
        userMap = r2.items.reduce((previous, value) => {
          return {
            ...previous,
            [value["githubAccount"]]: value["slackAccount"],
          };
        }, {});
      }
      console.log({ userMap });

      await postNotification(
        githubToken,
        token,
        slackChannel,
        userMap,
        webhookContext,
      );
    } catch (e) {
      return { error: `${e}` };
    }
    return { outputs: {} };
  },
);
