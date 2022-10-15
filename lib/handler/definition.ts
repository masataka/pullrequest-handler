import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

export default DefineFunction({
  callback_id: "handler",
  title: "Handle GitHub Webhook Payload",
  source_file: "lib/handler/mod.ts",
  input_parameters: {
    properties: {
      payload: {
        type: Schema.types.object,
        description: "Github Webhook Payload",
      },
    },
    required: ["payload"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});
