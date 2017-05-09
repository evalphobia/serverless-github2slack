const log = require('./log')

module.exports = {
  /**
   * convert convets .
   * targets: repo owner, issue creator, assignees.
   *
   * @param {Object} eventData - webhook request data
   * @return {Object} - names of stakeholders
   */
  convert: function (eventName, eventData) {
    log.debug('converter.convert');

    var data = {};
    data.eventName = eventName
    data.action = eventData.action
    data.is_valid_event = true;
    if (!isValidEvent(eventName)) {
      log.debug("not valid event: " + JSON.stringify(data));
      data.is_valid_event = false;
      return data;
    } else if (!isValidAction(eventData)) {
      log.debug("not valid action: " + JSON.stringify(data));
      data.is_valid_event = false;
      return data;
    }

    eventData.isIssue = !!eventData.issue
    eventData.isPullRequest = !!eventData.pull_request

    data.sender = getSender(eventData)
    data.owner = getOwner(eventData)
    data.creator = getCreator(eventData)
    data.assignee = getAssignee(eventData)
    data.assignees = getAssignees(eventData)
    data.assignees = addMapKey(data.assignees, data.assignee)
    data.mentions = getMentions(eventName, eventData)
    data.targets = getTargetMap(data)
    log.debug("Targets: " + JSON.stringify(data.targets));

    data.is_merged = isMerged(eventData)
    data.repo_name = getRepoName(eventData)
    data.html_url = getHtmlUrl(eventName, eventData)
    data.title = getTitle(eventName, eventData)
    data.body = getBody(eventName, eventData)
    return data;
  },
}

function isValidEvent(eventName) {
  switch (eventName) {
    case 'pull_request':
    case 'pull_request_review_comment':
    case 'issues':
    case 'issue_comment':
      return true;
  }
  return false;
}

function isValidAction(eventData) {
  switch (eventData.action) {
    case 'synchronize':
    case 'edited':
    case 'unassigned':
    case 'labeled':
    case 'unlabeled':
      return false
  }
  return true;
}

function isMerged(eventData) {
  if (!eventData.pull_request) return false;
  return !!eventData.pull_request.merged;
}

function getRepoName(eventData) {
  if (!eventData.repository) return;
  return eventData.repository.full_name;
}

function getHtmlUrl(eventName, eventData) {
  switch (eventName) {
    case 'issue_comment':
    case 'pull_request_review_comment':
      return eventData.comment.html_url;
    case 'issues':
      return eventData.issue.html_url;
    case 'pull_request':
      return eventData.pull_request.html_url;
    default:
      return 'unknown';
  }
}

function getTitle(eventName, eventData) {
  switch (eventName) {
    case 'issues':
    case 'issue_comment':
      return eventData.issue.title;
    case 'pull_request':
    case 'pull_request_review_comment':
      return eventData.pull_request.title;
    default:
      return 'unknown event';
  }
}

function getBody(eventName, eventData) {
  switch (eventData.action) {
    case 'closed':
    case 'labeled':
    case 'unlabeled':
      return '';
  }

  switch (eventName) {
    case 'issue_comment':
    case 'pull_request_review_comment':
      return eventData.comment.body;
    case 'issues':
      return eventData.issue.body;
    case 'pull_request':
      return eventData.pull_request.body;
    default:
      return 'unknown event';
  }
}

/**
 * getSender gets event sender from the webhook request data.
 *
 * @param {Object} eventData - webhook request data
 * @return {string|undefined} - event sender name
 */
function getSender(eventData) {
  if (!eventData.sender) return;
  return eventData.sender.login || undefined;
}

/**
 * getOwner gets repository owner from the webhook request data.
 * targets: repo owner, issue creator, assignees.
 *
 * @param {Object} eventData - webhook request data
 * @return {string|undefined} - repository owner name
 */
function getOwner(eventData) {
  if (!eventData.repository) return;
  if (!eventData.repository.owner) return;
  return eventData.repository.owner.login || undefined;
}

/**
 * getCreator gets issue/pr creator from the webhook request data.
 *
 * @param {Object} eventData - webhook request data
 * @return {string|undefined} - issue/pr creator name
 */
function getCreator(eventData) {
  if (eventData.isIssue) {
    if (!eventData.issue) return;
    if (!eventData.issue.user) return;
    return eventData.issue.user.login || undefined;
  } else if (eventData.isPullRequest) {
    if (!eventData.pull_request) return;
    if (!eventData.pull_request.user) return;
    return eventData.pull_request.user.login || undefined;
  }
  return;
}

/**
 * getAssignee gets issue/pr assignee from the webhook request data.
 *
 * @param {Object} eventData - webhook request data
 * @return {string|undefined} - issue/pr assignee name
 */
function getAssignee(eventData) {
  if (eventData.isIssue) {
    if (!eventData.issue) return;
    if (!eventData.issue.assignee) return;
    return eventData.issue.assignee.login || undefined;
  } else if (eventData.isPullRequest) {
    if (!eventData.pull_request) return;
    if (!eventData.pull_request.assignee) return;
    return eventData.pull_request.assignee.login || undefined;
  }
  return;
}

/**
 * getAssignees gets issue/pr assignees from the webhook request data.
 *
 * @param {Object} eventData - webhook request data
 * @return {Array[string]} - issue/pr assignees name
 */
function getAssignees(eventData) {
  let assignees = _getAssignees(eventData)
  return assignees.map(function (user) {
    return user.login;
  });
}

function _getAssignees(eventData) {
  if (eventData.isIssue) {
    if (!eventData.issue) return;
    return eventData.issue.assignees || [];
  } else if (eventData.isPullRequest) {
    if (!eventData.pull_request) return;
    return eventData.pull_request.assignees || [];
  }
  return [];
}

function getTargetMap(data) {
  var targets = {}
  log.debug('getTargetMap: ' + JSON.stringify(data));

  targets[data.owner] = true;
  targets[data.creator] = true;
  targets[data.assignee] = true;
  targets = addMapKey(targets, data.assignees)
  targets = addMapKey(targets, data.mentions)
  return targets;
}

/**
 * getMentions gets mention name from the comment.
 * (e.g. from the comment "Hi, @foobar plz review it", extract "foobar" )
 *
 * @param {string} eventName - GitHub event name(issues, issue_comment, pull_request, etc...)
 * @param {Object} eventData - webhook request data
 * @return {Array[string]} - mentioned user's name
 */
function getMentions(eventName, eventData) {
  var body = '';
  switch (eventName) {
    case 'issue_comment':
    case 'pull_request_review_comment':
      body = eventData.comment.body;
      break;
    case 'issues':
      body = eventData.issue.body;
      break;
    case 'pull_request':
      body = eventData.pull_request.body;
      break;
  }
  if (!body) return [];

  let mentions = body.match(/@[a-zA-Z0-9_-]+/g) || [];
  return mentions.map(function (key) {
    return key.substring(1);
  });
}


/**
 * addMapKey adds array value into the map key.
 *
 * @param {Object} map - map object
 * @param {Array} array - array
 * @return {Object}
 */
function addMapKey(map, array) {
  try {
    array.forEach(function (key) {
      map[key] = true;
    });
    return map
  } catch (e) {
    return map;
  }
}