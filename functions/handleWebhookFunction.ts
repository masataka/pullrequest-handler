import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import type {
  PullRequestEvent,
  PullRequestReviewEvent,
} from "https://esm.sh/@octokit/webhooks-types@6.10.0/schema.d.ts";
import ky from "https://esm.sh/ky@0.33.2";
import type {
  ActualGraph,
  GitHubUser,
  Review,
  WebhookContext,
} from "./graphTypes.ts";
import { PullRequest } from "./renderers/messageRenderer.tsx";
import { JSXSlack } from "npm:jsx-slack@5";

export const handleWebhookFunction = DefineFunction({
  callback_id: "handleWebhook",
  title: "Handle Webhook",
  source_file: "functions/handleWebhookFunction.ts",
  input_parameters: {
    properties: {
      payload: { type: Schema.types.object },
    },
    required: ["payload"],
  },
});

const pull_request_graph_query = `
query ($owner: String!, $name: String!, $pullRequestNumber: Int!) {
    repository(owner: $owner, name: $name) {
        name
        owner {
            login
            url
        }
        pullRequest(number: $pullRequestNumber) {
            author {
                login
                url
            }
            baseRefName
            body
            changedFiles
            commits(last: 1) {
                totalCount
                edges {
                    node {
                        commit {
                            messageBody
                            messageHeadline
                            sha: oid
                            checkSuites(first: 100) {
                                totalCount
                                edges {
                                    node {
                                        checkRuns(first: 100) {
                                            totalCount
                                            edges {
                                                node {
                                                    name
                                                    conclusion
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            headRefName
            mergeCommit {
                messageBody
                messageHeadline
                sha: oid
                checkSuites(first: 100) {
                    totalCount
                    edges {
                        node {
                            checkRuns(first: 100) {
                                totalCount
                                edges {
                                    node {
                                        name
                                        conclusion
                                    }
                                }
                            }
                        }
                    }
                }
            }
            mergeable
            merged
            pullRequestNumber: number
            reviewRequests(last: 100) {
                totalCount
                edges {
                    node {
                        requestedReviewer {
                            ... on Team {
                                __typename
                                login: name
                                url
                            }
                            ... on User {
                                __typename
                                login
                                url
                            }
                        }
                    }
                }
            }
            reviews(last: 100) {
                totalCount
                edges {
                    node {
                    author {
                        login
                        url
                    }
                    body
                    state
                    updatedAt
                    }
                }
            }
            state
            title
            url
        }
        url
    }
}
`;

export default SlackFunction(
  handleWebhookFunction,
  async ({ inputs, env, token, client }) => {
    // createContextFunction
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
    console.log({ webhookContext, githubToken, slackChannel, userMap });

    //getActualGraph
    // kyが怪しい。fetchで書き直す
    const result = await ky.post("https://api.github.com/graphql", {
      headers: { Authorization: `Bearer ${githubToken}` },
      json: {
        query: pull_request_graph_query,
        variables: {
          owner: webhookContext.repository.owner.login,
          name: webhookContext.repository.name,
          pullRequestNumber: webhookContext.pullRequestNumber,
        },
      },
    }).json<{ data: ActualGraph }>();

    //renderMessageBlock
    const blocks = JSXSlack(
      PullRequest({ ...webhookContext, userMap, ...result.data }),
    );
    console.log(blocks);

    // postMessageBlockWithMetadata
    const slackAPI = SlackAPI(token);
    await slackAPI.chat.postMessage({
      channel: slackChannel,
      blocks,
      text: "pullrequest-handler posts",
    }).catch((e) => {
      console.error(e);
    });

    return { outputs: {} };
  },
);
