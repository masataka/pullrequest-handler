import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

export default DefineFunction({
  callback_id: "handler",
  title: "Handle GitHub Webhook Payload",
  source_file: "lib/handler/mod.ts",
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
  output_parameters: {
    properties: {},
    required: [],
  },
});
