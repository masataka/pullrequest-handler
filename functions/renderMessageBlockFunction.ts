import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { WebhookContextType } from "./customTypes.ts";
import type {
  ActualGraph,
  KeyValueStore,
  WebhookContext,
} from "./graphTypes.ts";
import { PullRequest } from "./renderers/messageRenderer.tsx";

export const renderMessageBlockFunction = DefineFunction({
  callback_id: "renderMessageBlock",
  title: "Render Message Block",
  source_file: "functions/renderMessageBlockFunction.ts",
  input_parameters: {
    properties: {
      webhookContext: { type: WebhookContextType },
      userMap: { type: Schema.types.object },
      actualGraph: { type: Schema.types.object },
    },
    required: ["webhookContext", "userMap", "actualGraph"],
  },
  output_parameters: {
    properties: {
      block: { type: Schema.types.object },
    },
    required: ["block"],
  },
});

export default SlackFunction(
  renderMessageBlockFunction,
  ({ inputs }) => {
    const webhookContext = inputs.webhookContext as WebhookContext;
    const userMap = inputs.userMap as KeyValueStore<string>;
    const actualGraph = inputs.actualGraph as ActualGraph;
    const block = PullRequest({ ...webhookContext, userMap, ...actualGraph });
    console.log(block);
    return { outputs: { block } };
  },
);
