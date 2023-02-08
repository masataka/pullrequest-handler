import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import type {
  PullRequestEvent,
  PullRequestReviewEvent,
} from "https://esm.sh/@octokit/webhooks-types@6.10.0/schema.d.ts";
import { WebhookContext } from "./customTypes.ts";

export const createContextFunction = DefineFunction({
  callback_id: "createContext",
  title: "Create Context",
  source_file: "functions/createContextFunction.ts",
  input_parameters: {
    properties: {
      payload: { type: Schema.types.object },
    },
    required: ["payload"],
  },
  output_parameters: {
    properties: {
      webhookContext: { type: WebhookContext },
      githubToken: { type: Schema.types.string },
      slackChannel: { type: Schema.types.string },
      userMap: { type: Schema.types.object },
    },
    required: ["webhookContext", "githubToken", "slackChannel", "userMap"],
  },
});

export default SlackFunction(
  createContextFunction,
  async ({ inputs, env, client }) => {
    const payload = inputs.payload as PullRequestEvent & PullRequestReviewEvent;
    const { sender, action, repository, pull_request, review } = payload;
    const url = repository.html_url;

    const webhookContext = {
      sender: {
        login: sender.login,
        url: sender.html_url,
      },
      event: review ? "pull_request_review" : "pull_request",
      action,
      repository: {
        owner: {
          login: repository.owner.login,
          url,
        },
        name: repository.name,
        url: repository.html_url,
      },
      pullRequestNumber: pull_request.number,
    };

    const githubToken = env["githubToken"] || "";

    const r1 = await client.apps.datastore.get({
      datastore: "repositoryMap",
      id: url,
    });
    const slackChannel = r1.ok ? r1.item["slackChannel"] : env["slackChannel"] || "";

    const r2 = await client.apps.datastore.query({
      datastore: "userMap",
    });
    const userMap = (r2.ok ? r2.items : []).reduce((previous, value) => {
      return { ...previous, [value["githubAccount"]]: value["slackAccount"] };
    }, {});

    const outputs = { webhookContext, githubToken, slackChannel, userMap };
    console.log(outputs);

    return { outputs };
  },
);
