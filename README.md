github2slack-serverless
----

The lambda function to send GitHub event message to Slack.
Based on  [kawahara/github2slack-lambda](https://github.com/kawahara/github2slack-lambda),
this version supports multi channels, custom icons and attachment message with serverless framework.

![description image](https://raw.github.com/wiki/evalphobia/github2slack-lambda/images/github-slack.png)

## Features

- Mapping from GitHub username to Slack name
- Sending to multiple channels
- Setting custom icons

## Setting

- Slack
    - Setting [Incoming Webhook](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks)
- AWS SNS
    - Create topic which used from Github to lambda.
- Github
    - Add `Amazon SNS` type service in Integrations & services setting.

## Install

```bash
$ npm install

# You have to install serverless to use `sls` command
# $ npm install -g serverless
```

## Configuration

### serverless.yml

```yml
functions:
  slack:
    handler: handler.handler
    events:
      # set your SNS Topic ARN
      - sns: arn:aws:sns:ap-northeast-1:000000000000:serverless-github2slack
    environment:
      # set your slack webhook url
      SLACK_WEBHOOK_URL: https://hooks.slack.com/services/XXX/YYY/ZZZ
```

### config.json

```bash
$ cp ./config.json.sample ./config.json
$ cat ./config.json

{
  // set channels for each user.
  "channels": {
    "github_name": "#slack-channel",
    "evalphobia": "#xxx-takuma"
  },

  // set account to change mention name from github to slack.
  "account_map": {
    "@github_name": "@slack_name",
    "evalphobia": "takuma"
  },

  // set icons for the user of slack.
  "icon_map": {
    "github_name": ":baby:",
    "evalphobia": [":walking:", ":dancer:", ":bell:"]
  },

  // set default icons except for icon_map.
  "icons": [
    ":smile:",
    ":v:",
    ":pray:"
  ]
}
```

## Deploy

```bash
$ AWS_ACCESS_KEY_ID=<...> AWS_SECRET_ACCESS_KEY=<...> sls deploy -v
```

## Test function

```bash
$ AWS_ACCESS_KEY_ID=<...> AWS_SECRET_ACCESS_KEY=<...> sls invoke -f github2slack -l
```
