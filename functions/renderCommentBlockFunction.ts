import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { WebhookContextType } from "./customTypes.ts";
import type { ActualGraph } from "./graphTypes.ts";

export const renderCommentBlockFunction = DefineFunction({
  callback_id: "renderCommentBlockFunction",
  title: "Render Comment Block",
  source_file: "functions/renderCommentBlockFunction.ts",
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
  renderCommentBlockFunction,
  ({ inputs }) => {
    const actualGraph = inputs.actualGraph as ActualGraph;
    const block = actualGraph;
    return { outputs: { block } };
  },
);
