import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import type {
  PullRequestEvent,
  PullRequestReviewEvent,
} from "https://esm.sh/@octokit/webhooks-types@6.10.0/schema.d.ts";
import { WebhookContextType } from "./customTypes.ts";
import { GitHubUser, Review, WebhookContext } from "./graphTypes.ts";

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
      webhookContext: { type: WebhookContextType },
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
    const payload = inputs.payload as PullRequestEvent;
    const { sender, action, repository, pull_request } = payload;

    let requestedReviewer: GitHubUser | undefined;
    if (inputs.payload.requested_reviewer !== undefined) {
      requestedReviewer = {
        login: inputs.payload.requested_reviewer.login,
        url: inputs.payload.requested_reviewer.html_url,
      };
    } else if (inputs.payload.requested_team !== undefined) {
      requestedReviewer = {
        login: inputs.payload.requested_team.name,
        url: inputs.payload.requested_team.html_url,
      };
    }

    const event = inputs.payload.review !== undefined
      ? "pull_request_review"
      : "pull_request";

    let review: Review | undefined;
    if (event === "pull_request_review") {
      const reviewEvent = inputs.payload as PullRequestReviewEvent;
      review = {
        author: {
          login: reviewEvent.review.user.login,
          url: reviewEvent.review.user.html_url,
        },
        body: reviewEvent.review.body,
        state: reviewEvent.review.state.toUpperCase(),
        updatedAt: reviewEvent.review.submitted_at,
      };
    }

    const webhookContext: WebhookContext = {
      sender: {
        login: sender.login,
        url: sender.html_url,
      },
      event,
      action,
      repository: {
        owner: {
          login: repository.owner.login,
          url: repository.owner.html_url,
        },
        name: repository.name,
        url: repository.html_url,
      },
      pullRequestNumber: pull_request.number,
      requestedReviewer,
      review,
    };

    const githubToken = env["githubToken"] || "";

    const r1 = await client.apps.datastore.get({
      datastore: "repositoryMap",
      id: repository.html_url,
    });
    const slackChannel = r1.ok
      ? r1.item["slackChannel"]
      : env["slackChannel"] || "";

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
