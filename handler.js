import notifier from './src/notifier' ;


/**
  AWS lambda event handler
*/
module.exports.handler = function(event, context) {
  console.log('Received GitHub event:', JSON.stringify(event));
  try {
    let data = JSON.parse(event.Records[0].Sns.Message);
    let eventName = event.Records[0].Sns.MessageAttributes['X-Github-Event'].Value;
    notifier.notify(context, eventName, data);
  } catch(err) {
    console.error('[EXCEPTION] '+ err);
  }
};
