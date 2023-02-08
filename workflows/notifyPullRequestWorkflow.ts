import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { verifyWebhookFunction } from "../functions/verifyWebhookFunction.ts";
import { createContextFunction } from "../functions/createContextFunction.ts";
import { findMessageFunction } from "../functions/findMessageFunction.ts";
import { getActualGraphFunction } from "../functions/getActualGraphFunction.ts";
import { renderMessageBlockFunction } from "../functions/renderMessageBlockFunction.ts";
import { handleWebhookFunction } from "../functions/handleWebhookFunction.ts";

export const notifyPullRequestWorkflow = DefineWorkflow({
  callback_id: "notifyPullRequestWorkflow",
  title: "Notify PullRequest",
  input_parameters: {
    properties: {
      payload: { type: Schema.types.object },
    },
    required: ["payload"],
  },
});

const check = notifyPullRequestWorkflow.addStep(verifyWebhookFunction, {
  payload: notifyPullRequestWorkflow.inputs.payload,
});

if (check.outputs.ok) {
  const step1 = notifyPullRequestWorkflow.addStep(createContextFunction, {
    payload: notifyPullRequestWorkflow.inputs.payload,
  });

  notifyPullRequestWorkflow.addStep(findMessageFunction, {
    metadataEventType: notifyPullRequestWorkflow.id,
    repositoryURL: step1.outputs.webhookContext.repository.url,
    pullRequestNumber: step1.outputs.webhookContext.pullRequestNumber,
    slackChannel: step1.outputs.slackChannel,
  });

  const step2 = notifyPullRequestWorkflow.addStep(getActualGraphFunction, {
    owner: step1.outputs.webhookContext.repository.owner.login,
    name: step1.outputs.webhookContext.repository.name,
    pullRequestNumber: step1.outputs.webhookContext.pullRequestNumber,
    githubToken: step1.outputs.githubToken,
  });

  const step3 = notifyPullRequestWorkflow.addStep(renderMessageBlockFunction, {
    webhookContext: step1.outputs.webhookContext,
    userMap: step1.outputs.userMap,
    actualGraph: step2.outputs.actualGraph,
  });

  notifyPullRequestWorkflow.addStep(handleWebhookFunction, {
    slackChannel: step1.outputs.slackChannel,
    block: step3.outputs.block,
  });
}
