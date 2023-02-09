import type { ActualGraph } from "./types.ts";

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

export default async function (
  githubToken: string,
  owner: string,
  name: string,
  pullRequestNumber: number,
): Promise<ActualGraph> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    body: JSON.stringify({
      query: pull_request_graph_query,
      variables: {
        owner,
        name,
        pullRequestNumber,
      },
    }),
    headers: {
      Authorization: `Bearer ${githubToken}`,
      "content-type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Fetch error: ${response.statusText}`);
  }
  const json = await response.json() as { data: ActualGraph };
  return json.data;
}