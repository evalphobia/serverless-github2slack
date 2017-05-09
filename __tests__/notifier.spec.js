jest.dontMock('../src/notifier');
const env = Object.assign({}, process.env);

describe('notifier', () => {
  let defaultContext = {
    done: () => {}
  }
  let vars = [
    'SLACK_WEBHOOK_URL',
  ];

  beforeEach(() => {
    vars.forEach(v => {
      process.env[v] = undefined;
      delete process.env[v]
    })
  });

  describe('notify', () => {
    test('empty data', () => {
      let notifier = require('../src/notifier');
      let result = notifier.notify(defaultContext, 'hoge', {})
      expect(result).toBeUndefined();
    });
    /*
    test('with SNS data', () => {
      return sls.getProject().getFunction('slack').run('dev', 'ap-northeast-1', {})
      .then(result => {
        console.log(result)
        expect(result.response.message).toEqual('');
      });
    });
    */

  })
})