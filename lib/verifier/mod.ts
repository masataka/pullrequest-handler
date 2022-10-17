import { SlackFunction } from "deno-slack-sdk/mod.ts";
import definition from "./definition.ts";
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

export default SlackFunction(
  definition,
  ({ inputs, env }) => {
    const result = hmac(
      "sha256",
      env["githubSecret"],
      JSON.stringify(inputs.payload),
      "utf8",
      "base64",
    );
    if (`sha256=${result}` != inputs.signature) {
      /* 現在のところ、リクエストヘッダへのアクセス方法が不明で値が取れない。
      return {
        completed: false,
      };
      */
    }
    return {
      outputs: {},
    };
  },
);
