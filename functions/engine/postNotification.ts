import { SlackAPI } from "deno-slack-api/mod.ts";

import getActualGraph from "./getActualGraph.ts";
import { renderActionLog, renderNotification } from "./renderers.tsx";
import type { KeyValueStore, WebhookContext } from "./types.ts";

const EVENT_TYPE = "pull-request-notify";

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

async function upsertMessage(
  slackToken: string,
  slackChannel: string,
  owner: string,
  name: string,
  number: number,
  // deno-lint-ignore no-explicit-any
  blocks: any,
  root: boolean,
  ts: string | null,
) {
  const payload = {
    channel: slackChannel,
    blocks,
    text: EVENT_TYPE,
  };
  const metadata = {
    metadata: {
      event_type: EVENT_TYPE,
      event_payload: {
        owner,
        name,
        number,
      },
    },
  };
  console.log({ payload, metadata });

  const client = SlackAPI(slackToken);
  if (ts) {
    if (root) {
      return await client.chat.update({ ...payload, ...metadata, ts });
    }
    return await client.chat.postMessage({ ...payload, thread_ts: ts });
  }
  return await client.chat.postMessage({ ...payload, ...metadata });
}

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

  // MessageTS
  let ts = await findPreviousMessage(
    slackToken,
    slackChannel,
    owner,
    name,
    number,
  );
  console.log({ ts });

  //MessageBlocks
  const renderModel = { ...webhookContext, userMap, ...actualGraph };
  const notification = renderNotification(renderModel);

  const result = await upsertMessage(
    slackToken,
    slackChannel,
    owner,
    name,
    number,
    notification,
    true,
    ts,
  );
  if (result.ok) {
    ts = result.ts;
    if (ts) {
      const actionLog = renderActionLog(renderModel);
      if (actionLog) {
        await upsertMessage(
          slackToken,
          slackChannel,
          owner,
          name,
          number,
          actionLog,
          false,
          ts,
        );
      }
    }
  }
}
