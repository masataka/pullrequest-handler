import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";

export const findMessageFunction = DefineFunction({
  callback_id: "findMessage",
  title: "Find Message",
  source_file: "functions/findMessageFunction.ts",
  input_parameters: {
    properties: {
      metadataEventType: { type: Schema.types.string },
      repositoryURL: { type: Schema.types.string },
      pullRequestNumber: { type: Schema.types.number },
      slackChannel: { type: Schema.types.string },
    },
    required: [
      "metadataEventType",
      "repositoryURL",
      "pullRequestNumber",
      "slackChannel",
    ],
  },
  output_parameters: {
    properties: {
      ts: { type: Schema.types.string },
    },
    required: [],
  },
});

type SlackMessage = {
  metadata: {
    event_type: string;
    event_payload: {
      repositoryURL: string;
      pullRequestNumber: number;
    };
  };
  ts: string;
};

export default SlackFunction(
  findMessageFunction,
  async ({ inputs, token }) => {
    const slackAPI = SlackAPI(token);
    const result = await slackAPI.conversations.history({
      channel: inputs.slackChannel,
      include_all_metadata: true,
      limit: 100,
    });

    if (result.ok && Array.isArray(result.messages)) {
      for (const message of result.messages) {
        if ("metadata" in message) {
          const withMetadata = message as SlackMessage;
          if (withMetadata.metadata.event_type === inputs.metadataEventType) {
            const actual = withMetadata.metadata.event_payload;
            if (
              actual.repositoryURL === inputs.repositoryURL &&
              actual.pullRequestNumber === inputs.pullRequestNumber
            ) {
              return { outputs: { ts: withMetadata.ts } };
            }
          }
        }
      }
    }
    return { outputs: { ts: "" } };
  },
);
