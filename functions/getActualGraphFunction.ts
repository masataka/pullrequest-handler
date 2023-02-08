import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import ky from "https://esm.sh/ky";

export const getActualGraphFunction = DefineFunction({
  callback_id: "getActualGraph",
  title: "Get Actual Graph",
  source_file: "functions/getActualGraphFunction.ts",
  input_parameters: {
    properties: {
      owner: { type: Schema.types.string },
      name: { type: Schema.types.string },
      pullRequestNumber: { type: Schema.types.number },
      githubToken: { type: Schema.types.string },
    },
    required: ["owner", "name", "pullRequestNumber", "githubToken"],
  },
  output_parameters: {
    properties: {
      actualGraph: { type: Schema.types.object },
    },
    required: ["actualGraph"],
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
  getActualGraphFunction,
  async ({ inputs }) => {
    const actualGraph = await ky.post("https://api.github.com/graphql", {
      headers: { Authorization: `Bearer ${inputs.githubToken}` },
      json: { query: pull_request_graph_query, variables: inputs },
    }).json();
    return { outputs: { actualGraph } };
  },
);
