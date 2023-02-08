import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { WebhookContextType } from "./customTypes.ts";
import type {
  ActualGraph,
  KeyValueStore,
  WebhookContext,
} from "./graphTypes.ts";
import { PullRequest } from "./renderers/messageRenderer.tsx";
import { JSXSlack } from "npm:jsx-slack@5";

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
      blocks: { type: Schema.types.object },
    },
    required: ["blocks"],
  },
});

export default SlackFunction(
  renderMessageBlockFunction,
  ({ inputs }) => {
    const webhookContext = inputs.webhookContext as WebhookContext;
    const userMap = inputs.userMap as KeyValueStore<string>;
    const actualGraph = inputs.actualGraph as ActualGraph;
    const blocks = JSXSlack(
      PullRequest({ ...webhookContext, userMap, ...actualGraph }),
    );
    console.log(blocks);
    return { outputs: { blocks } };
  },
);
