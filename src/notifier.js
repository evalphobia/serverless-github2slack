import config from './config' ;
import converter from './converter';
import log from './log' ;
import slack from './slack' ;


module.exports = {
  notify(context, eventName, eventData) {
    log.debug('notifier.notify');
    let data = converter.convert(eventName, eventData);
    if (!data.is_valid_event) {
      context.done();
      return;
    }
    log.debug('data: ' + JSON.stringify(data));

    // remove event sender and non-channel target
    var targets = {}
    targets = removeSender(data.eventName, data.targets, data.sender);
    targets = removeNonChannel(targets);
    log.debug('targets: ' + JSON.stringify(targets));

    let channelList = config.get('channels') || {}
    log.debug('channelList: ' + JSON.stringify(channelList));
    let channels = Object.keys(targets).filter(key => {
      return !!channelList[key]
    });
    if (channels.length == 0) {
      context.done();
      return;
    }

    // return if unit testing.
    if (!context) {
      return channels;
    }

    log.debug('channels: ' + JSON.stringify(channels));
    // 各ユーザーのチャンネルに投稿
    Promise.all(channels.map(user => {
      log.info('user: ' + user);
      return slack.sendMessage(data, user);
    })).then(() =>{
      context.done();
    });
  },
}


// 発言者を除外する
function removeSender(eventData, targets, sender) {
    // 作成関連のイベントの場合は、発言者でも除外しない
    switch (eventData.action) {
      case 'opened':
      case 'closed':
      case 'reopened':
        return;
    }

    delete targets[sender]
    return targets;
}

// チャンネル対象者以外を除外する
function removeNonChannel(targets) {
  var validList = {};
  let channelList = config.get('channels') || {}
  Object.keys(targets).forEach(function (key) {
    if (!channelList[key]) {
      return;
    }
    validList[key] = true;
  });
  return validList;
}
