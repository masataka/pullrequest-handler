# Pull-Request Handler

## Create a Link Trigger

To create a Link Trigger, run the following command:

```zsh
$ slack trigger create --trigger-def lib/trigger.ts
```

After selecting a Workspace, the output provided will include the Link Trigger
Shortcut URL. Copy and paste this URL into a channel as a message, or add it as
a bookmark in a channel of the Workspace you selected.

## Running Your Project Locally

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

## Testing

Test filenames should be suffixed with `_test`. Run all tests with `deno test`:

```zsh
$ deno test
```

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
