import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

export default DefineFunction({
  callback_id: "verifier",
  title: "Verify Request",
  source_file: "lib/verifier/mod.ts",
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
