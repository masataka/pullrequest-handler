import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import notifier from "./handler/definition.ts";

const defaultWorkflow = DefineWorkflow({
  callback_id: "default-workflow",
  title: "Handle webhook payload",
  input_parameters: {
    properties: {
      payload: {
        type: Schema.types.object,
      },
    },
    required: ["payload"],
  },
});

defaultWorkflow.addStep(notifier, {
  payload: defaultWorkflow.inputs.payload,
});

export default defaultWorkflow;
