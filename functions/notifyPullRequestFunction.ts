import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import createContext from "./engine/createContext.ts";
import postNotification from "./engine/postNotification.ts";

export const notifyPullRequestFunction = DefineFunction({
  callback_id: "notifyPullRequestFunction",
  title: "Notify PullRequest Function",
  source_file: "functions/notifyPullRequestFunction.ts",
  input_parameters: {
    properties: {
      payload: { type: Schema.types.object },
    },
    required: ["payload"],
  },
});

export default SlackFunction(
  notifyPullRequestFunction,
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
        datastore: "userAccountMap",
      });
      let userAccountMap = {};
      if (r2.ok) {
        userAccountMap = r2.items.reduce((previous, value) => {
          return {
            ...previous,
            [value["githubAccount"]]: value["slackAccount"],
          };
        }, {});
      }
      console.log({ userAccountMap });

      await postNotification(
        githubToken,
        token,
        slackChannel,
        userAccountMap,
        webhookContext,
      );
    } catch (e) {
      return { error: `${e}` };
    }
    return { outputs: {} };
  },
);
