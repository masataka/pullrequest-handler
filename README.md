# PullRequest Handler

Notify the pull request reviewer that a review request is coming, Notify the
pull request author as soon as the reviewer completes the approval.

- Post a message to Slack when a particular user is added as a reviewer to a
  pull request
- Update messages already posted at the following events
  - Yet another specific user is added as a reviewer
  - Reviewer completes review
  - Pull requests are merged
- The update history is threaded to the message
- Mention the Slack account of the target GitHub user

#### handle event of GitHub Actions

- Event > Activity Type
  - pull_request
    - opened
      - Even if a review request is made at the same time as the PR opens, the
        events will occur separately.
    - closed
      - When a pull request merges, the `pull_request` is automatically
        `closed`.
      - with a conditional that checks the `merged` value of the event. also
        `merged_by`.
    - edited
    - reopened
    - review_requested
      - see `payload.requested_reviewer`.
    - review_request_removed
      - see `payload.requested_reviewer`.
  - pull_request_review
    - submitted
      - when a pull request has been approved
      - check the `payload.review.state`, state == `approved` then PR was
        approved.
    - dismissed
      - Change the state of the review, but not the state of the PR.

#### Call Slack API

- chat.postMessage
  - scope
    - `chat:write`
- chat.update
  - scope
    - `chat:write`
- conversations.history
  - scope
    - `channels:history`
    - `groups:history`
    - `im:history`
    - `mpim:history`
- datastore
  - scope
    - `datastore:read`
    - `datastore:write`

## 1.Deploying PullRequest Handler to your Slack

You can deploy the production version of PullRequest Handler to Slack hosting
using `slack deploy`:

```zsh
% slack deploy
```

After deploying, create new Webhook Trigger and new Link Triggers for this app.
Once the Triggers are invoked, the associated Workflows should run.

## 2.Create Triggers

To create a Link Trigger, run the following command:

```zsh
# Webhook Trigger
% slack trigger create --trigger-def triggers/notifyPullRequestTrigger.ts
```

After selecting a Workspace, the output provided will include the Webhook
Trigger Payload URL. Copy and paste this URL into a GitHub repository
setting/Webhooks.

```zsh
# Link Trigger
% slack trigger create --trigger-def triggers/addRepositoryMappingTrigger.ts
% slack trigger create --trigger-def triggers/addUserAccountMappingTrigger.ts
```

After selecting a Workspace, the output provided will include the Link Trigger
Shortcut URL. Copy and paste this URL into a channel as a message, or add it as
a bookmark in a channel of the Workspace you selected.

## 3.Add GihHub token

Register GitHub API Token.

```zsh
% slack env add githubToken <token>
```

## 4.Register target repositories to Slack Datastore

Run the addRepositoryMappingTrigger in your slack workspace. target repository's
URL and target branch name, Slack channel are needed.

for example...

- repositoryURL: https://github.com/masataka/pullrequest-handler
- branch: develop
- slackChannel: #ntf-pullrequest

## 5.Register account mappings to Slack Datastore

Run the addUserAccountMappingTrigger in your slack workspace. you can register
GitHub account and Slack account pairs.

## 6.Add PullRequest Handler to slack channel

Add this app to Slack channel. setting -> integration -> app.
