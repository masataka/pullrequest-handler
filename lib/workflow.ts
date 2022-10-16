import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import handler from "./handler/definition.ts";

const defaultWorkflow = DefineWorkflow({
  callback_id: "default-workflow",
  title: "Handle webhook payload",
  input_parameters: {
    properties: {
      signature: {
        type: Schema.types.string,
      },
      payload: {
        type: Schema.types.object,
      },
    },
    required: ["signature", "payload"],
  },
});

defaultWorkflow.addStep(handler, {
  signature: defaultWorkflow.inputs.signature,
  payload: defaultWorkflow.inputs.payload,
});

export default defaultWorkflow;
