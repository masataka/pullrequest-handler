import { SlackFunction } from "deno-slack-sdk/mod.ts";
import definition from "./definition.ts";

export default SlackFunction(
  definition,
  ({ inputs }) => {
    // 現在のところ、リクエストヘッダへのアクセス方法が不明で値が取れない。
    console.log(`signature: ${inputs.signature}`);
    return { outputs: {} };
  },
);
