# Pull-Request Handler

## Requirements

Notify the pull request reviewer that a review request is coming,
Notify the pull request author as soon as the reviewer completes the approval.

- Post a message to Slack when a particular user is added as a reviewer to a pull request
- Update messages already posted at the following events
    - Yet another specific user is added as a reviewer
    - Reviewer completes review
    - Pull requests are merged
- The update history is threaded to the message
- Mention the Slack account of the target GitHub user

## handle event of GitHub Actions

- Event > Activity Type
    - **pull_request**
        - opened
            - Even if a review request is made at the same time as the PR opens, the events will occur separately.
        - **closed**
            - When a pull request merges, the `pull_request` is automatically `closed`.
            - with a conditional that checks the `merged` value of the event. also `merged_by`.
        - **edited**
        - reopened
            - I don't know...
        - **review_requested**
            - see `payload.requested_reviewer`.
        - **review_request_removed**
            - see `payload.requested_reviewer`.
    - **pull_request_review**
        - **submitted**
            - when a pull request has been approved
            - check the `payload.review.state`, state == `approved` then PR was approved.
        - dismissed
            - Change the state of the review, but not the state of the PR.

## Call Slack API

- **chat.postMessage**
    - scope
        - `chat:write`
- **chat.update**
    - scope
        - `chat:write`
- **conversations.history**
    - scope
        - `channels:history`
        - `groups:history`
        - `im:history`
        - `mpim:history`
- datastore
    - scope
        - `datastore:read`
        - `datastore:write`
 

## Create a Link Trigger

To create a Link Trigger, run the following command:

```zsh
$ slack trigger create --trigger-def triggers/pullRequestEventTrigger.ts
```

After selecting a Workspace, the output provided will include the Link Trigger
Shortcut URL. Copy and paste this URL into a channel as a message, or add it as
a bookmark in a channel of the Workspace you selected.

## Running Your Project Locally

The .env file is needed when running tests locally.

```yml
githubToken=ghp_abcdefghijklmnopqrstuvwxyz0123456789
```

While building your app, you can see your changes propagated to your workspace
in real-time with `slack run`. In both the CLI and in Slack, you'll know an app
is the development version if the name has the string `(dev)` appended.

```zsh
# Run app locally
$ slack run

Connected, awaiting events
```

Once running, [previously created Shortcut URLs](#create-a-link-trigger)
associated with the `(dev)` version of your app can be used to start Workflows.

To stop running locally, press `<CTRL> + C` to end the process.

## Deploying Your App

Once you're done with development, you can deploy the production version of your
app to Slack hosting using `slack deploy`:

```zsh
$ slack deploy
```

After deploying, [create new Link Triggers](#create-a-link-trigger) for the
production version of your app (not appended with `(dev)`). Once the Triggers
are invoked, the associated Workflows should run just as they did when
developing locally.

### Viewing Activity Logs

Activity logs for the production instance of your application can be viewed with
the `slack activity` command:

```zsh
$ slack activity
```
