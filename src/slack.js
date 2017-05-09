const request = require('request-promise')
const config = require('./config')
const colors = require('./colors')
const log = require('./log')

module.exports = {
  sendMessage(data, user) {
    let payload = makePayload(data, user);
    log.debug(user + ': ' + JSON.stringify(payload))
    return send(payload)
  },
}

function send(data) {
  log.info('send slack: ' + JSON.stringify(data))
  return request
    .post(data)
}

function makePayload(data, user) {
  let defaultName = 'ぎっはぶ';
  let channelList = config.get('channels')

  var opt = {
    channel: channelList[user],
    username: defaultName,
    icon_emoji: getDefaultIcon(),
    link_names: 1,
  };

  let iconMap = config.get('icon_map')
  let sender = data.sender;
  if (iconMap[sender]) {
    opt.icon_emoji = getUserIcon(sender);
    opt.username = sender;
  }

  opt.attachments = slackAttachData(data, user);
  return {
    uri: config.get('SLACK_WEBHOOK_URL'),
    headers: {
      'Content-Type': 'application/json'
    },
    json: opt,
  };
}

function slackAttachData(data, user) {
  var attach = {};
  attach.author_name = data.sender;
  attach.pretext = slackPretext(data);
  attach.title = data.title
  attach.title_link = data.html_url
  attach.fallback = attach.title + ' (' + attach.title_link + ')';
  attach.text = convertName(data.body, user);
  attach.color = slackColor(data);
  attach.fields = slackFields(data);
  attach.footer = data.repo_name;

  return [attach];
}

// 対象のユーザーについてGithubユーザー名をSlackユーザー名に変換する
function convertName(body, target) {
  if (!body) return body;

  let accounts = config.get('account_map')
  return body.replace(/~[a-zA-Z0-9_\-]+/g, function (key) {
    var name = key.substring(1);
    var slackName = accounts[name];
    var isTarget = (name == target)
    name = slackName ? slackName : name;
    name = isTarget ? '@' + name : name;
    return name
  });
}

function slackPretext(data) {
  switch (data.eventName) {
    case 'issue_comment':
      return 'Issue Comment';
    case 'pull_request_review_comment':
      return 'PR Comment:';
    case 'issues':
      return 'Issue: ' + data.action;
    case 'pull_request':
      if (data.action == 'closed' && data.is_merged) return 'PullRequest: merged';
      return 'PullRequest: ' + msg.action;
    default:
      return '';
  }
}

function slackColor(data) {
  switch (data.eventName) {
    case 'issue_comment':
    case 'pull_request_review_comment':
      return colors['AirforceBlue'];
  }

  switch (data.action) {
    case 'created':
      return colors['GrannySmithApple'];
    case 'closed':
      if (data.is_merged) return colors['LavenderBlue'];
      else return colors['onyx'];
    case 'labeled':
      return colors['citrine'];
    case 'unlabeled':
      return colors['eggshell'];
    case 'assigned':
      return colors['amaranth'];
    case 'unassigned':
      return colors['OldRose'];
  }
  return colors['PaleSilver'];
}

function slackFields(data) {
  var fields = [];

  // add assignees
  let assignee = data.assignees ? data.assignees.join(" ") : undefined
  if (!!assignee) {
    fields.push({
      "title": "Assignee",
      "value": assignee,
      "short": true,
    });
  }

  // add labels
  if (!!data.label) {
    fields.push({
      "title": "Label",
      "value": data.label.name,
      "short": true,
    });
  }

  return fields;
}

function getUserIcon(name) {
  let icons = config.get('icon_map')
  return getRandom(icons[name]);
}

function getDefaultIcon() {
  return getRandom(config.get('icons'));
}

function getRandom(arr) {
  if (!Array.isArray(arr)) {
    return arr;
  }

  var keys = Object.keys(arr);
  var index = keys[Math.floor(Math.random() * keys.length)];
  return arr[index];
}