import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { PullRequest } from "./engine/messageRenderer.tsx";
import { JSXSlack } from "npm:jsx-slack@5";
import createContext from "./engine/createContext.ts";
import getActualGraph from "./engine/getActualGraph.ts";

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
    let branch = "develop";
    let slackChannel = env["slackChannel"];
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
        return { ...previous, [value["githubAccount"]]: value["slackAccount"] };
      }, {});
    }
    console.log({ userMap });

    //ActualGraph
    const actualGraph = await getActualGraph(
      githubToken,
      webhookContext.repository.owner.login,
      webhookContext.repository.name,
      webhookContext.pullRequestNumber,
    );
    console.log(actualGraph);

    //renderMessageBlock
    const blocks = JSXSlack(
      PullRequest({ ...webhookContext, userMap, ...actualGraph }),
    );

    // postMessageBlockWithMetadata
    const slackAPI = SlackAPI(token);
    await slackAPI.chat.postMessage({
      channel: slackChannel,
      blocks,
      text: "pullrequest-handler posts",
    }).catch((e) => {
      console.error(e);
    });

    return { outputs: {} };
  },
);
