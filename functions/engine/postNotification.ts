import { SlackAPI } from "deno-slack-api/mod.ts";
import { JSXSlack } from "npm:jsx-slack@5";

import { WebhookContext } from "./types.ts";
import getActualGraph from "./getActualGraph.ts";
import { PullRequest } from "./messageRenderer.tsx";

import type { KeyValueStore } from "./types.ts";

export default async function (
  webhookContext: WebhookContext,
  userMap: KeyValueStore<string>,
  githubToken: string,
  slackToken: string,
  slackChannel: string,
): Promise<boolean> {
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
  const client = SlackAPI(slackToken);
  const response = await client.chat.postMessage({
    channel: slackChannel,
    blocks,
    text: "pullrequest-handler posts",
  }).catch((e) => {
    console.error(e);
  });
  return response ? true : false;
}
