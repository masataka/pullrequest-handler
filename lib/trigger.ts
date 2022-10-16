import { Trigger } from "deno-slack-api/types.ts";
import defaultWorkflow from "./workflow.ts";

const defaultTrigger: Trigger<typeof defaultWorkflow.definition> = {
  type: "webhook",
  name: "handle-webhook",
  workflow: "#/workflows/default-workflow",
  inputs: {
    signature: {
      // 現在のところ、リクエストヘッダへのアクセス方法が不明で値が取れない。
      value: "{{headers.X-Hub-Signature-256}}",
    },
    payload: {
      value: "{{data}}",
    },
  },
};

export default defaultTrigger;
