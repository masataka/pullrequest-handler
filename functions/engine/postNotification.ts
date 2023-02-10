import { SlackAPI } from "deno-slack-api/mod.ts";
import { JSXSlack } from "npm:jsx-slack@5";

import getActualGraph from "./getActualGraph.ts";
import { PullRequest } from "./messageRenderer.tsx";
import type { KeyValueStore, WebhookContext } from "./types.ts";

type SlackMessage = {
  metadata: {
    event_type: string;
    event_payload: {
      owner: string;
      name: string;
      number: number;
    };
  };
  ts: string;
};

async function findPreviousMessage(
  slackToken: string,
  slackChannel: string,
  owner: string,
  name: string,
  number: number,
): Promise<string | null> {
  const client = SlackAPI(slackToken);
  const result = await client.conversations.history({
    channel: slackChannel,
    include_all_metadata: true,
    limit: 100,
  });

  if (result.ok && Array.isArray(result.messages)) {
    for (const message of result.messages) {
      if ("metadata" in message) {
        const withMetadata = message as SlackMessage;
        if (withMetadata.metadata.event_type === EVENT_TYPE) {
          const actual = withMetadata.metadata.event_payload;
          if (
            actual.owner === owner && actual.name === name &&
            actual.number === number
          ) {
            return withMetadata.ts;
          }
        }
      }
    }
  }
  return null;
}

const EVENT_TYPE = "pull-request-notify";

export default async function (
  webhookContext: WebhookContext,
  userMap: KeyValueStore<string>,
  githubToken: string,
  slackToken: string,
  slackChannel: string,
) {
  const owner = webhookContext.repository.owner.login;
  const name = webhookContext.repository.name;
  const number = webhookContext.number;
  //ActualGraph
  const actualGraph = await getActualGraph(githubToken, owner, name, number);
  console.log(actualGraph);

  //renderMessageBlock
  const blocks = JSXSlack(
    PullRequest({ ...webhookContext, userMap, ...actualGraph }),
  );

  // postMessageBlockWithMetadata
  const client = SlackAPI(slackToken);

  const ts = await findPreviousMessage(
    slackToken,
    slackChannel,
    owner,
    name,
    number,
  );
  console.log({ ts });

  const payload = {
    channel: slackChannel,
    blocks,
    text: EVENT_TYPE,
    metadata: {
      event_type: EVENT_TYPE,
      event_payload: {
        owner,
        name,
        number,
      },
    },
  };
  console.log({ payload });

  let result;
  if (ts === null) {
    result = await client.chat.postMessage(payload);
  } else {
    result = await client.chat.update({ ...payload, ts });
  }
  console.log({ result });

  return {
    ok: !!result.ok,
    error: result.error || "",
    ts: result.ts || "",
  };
}
