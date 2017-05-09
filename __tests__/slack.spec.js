import rewire from 'rewire';
import path from 'path';
const slack = rewire(path.join(__dirname, '../src/slack'))
const env = Object.assign({}, process.env);

const defaultConfig = {
  SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/XXX/YYY/ZZZ',
  channels: {
    "hoge": "@takuma",
    "evalphobia": "@takuma",
  },
  icons: [':smile:'],
  icon_map: {},
  account_map: {},
}


describe('slack', () => {
  let vars = [
    'SLACK_WEBHOOK_URL',
  ];
  beforeEach(() => {
    vars.forEach(v => {
      process.env[v] = undefined;
      delete process.env[v]
    })

    // mock config
    slack.__set__('config.get', (key) => {
      return defaultConfig[key]
    })
  });

  describe('sendMessage', () => {
    test('empty data', () => {
      expect.assertions(2);
      let result = slack.sendMessage({}, 'hoge')
      return result.catch((data) => {
        expect(data.statusCode).toEqual(404)
        expect(data.error).toEqual('No team')
      })
    });

    /*
    test('default data', () => {
      let defaultData = {
        eventName: 'issues',
        action: 'opened',
        is_valid_event: true,
        is_merged: false,
        sender: 'sender',
        owner: 'owner',
        creator: 'creator',
        title: 'title',
        body: 'body',
        repo_name: 'evalphobia/serverless-github2slack',
        html_url: 'https://github.com/evalphobia/serverless-github2slack/issues/2',
        assignees: [],
        mentions: ['github', 'evalphobia'],
      }

      slack.__set__('config.get', (key) => {
        return Object.assign(defaultConfig, {
          SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL
        })[key]
      })

      expect.assertions(2);
      let result = slack.sendMessage(defaultData, 'hoge')
      return result.then((data) => {
        expect(data).toEqual('ok')
      })
    });
    */
  })

  describe('makePayload', () => {
    let defaultData = {
      eventName: 'issues',
      action: 'opened',
      is_valid_event: true,
      is_merged: false,
      sender: 'sender',
      owner: 'owner',
      creator: 'creator',
      title: 'title',
      body: 'body',
      repo_name: 'evalphobia/serverless-github2slack',
      html_url: 'https://github.com/evalphobia/serverless-github2slack/issues/2',
      assignees: [],
      mentions: ['github', 'evalphobia'],
    }

    let defaultResult = {
      uri: defaultConfig.SLACK_WEBHOOK_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      link_names: 1,
      username: 'ぎっはぶ',
    }

    let tests = [{
      name: 'empty data',
      expected: defaultResult,
      user: 'hoge',
      data: {}
    }, {
      name: 'event.github.issues_create.json',
      expected: defaultResult,
      user: 'hoge',
      data: require('./event.github.issues_create.json')
    }, {
      name: 'default data',
      expected: defaultResult,
      user: 'hoge',
      data: defaultData,
    }, ]

    const fn = slack.__get__('makePayload');
    tests.forEach(t => {
      test(t.name, () => {
        let result = fn(t.data, t.user)
        expect(result.uri).toEqual(t.expected.uri);
        expect(result.headers).toEqual(t.expected.headers);
        expect(result.json.link_names).toEqual(t.expected.link_names);
        expect(result.json.username).toEqual(t.expected.username);
      });
    });
  })

  describe('slackAttachData', () => {
    let defaultData = {
      eventName: 'issues',
      action: 'opened',
      is_valid_event: true,
      is_merged: false,
      sender: {'login': 'sender'},
      owner: 'owner',
      creator: 'creator',
      title: 'title',
      body: 'body',
      repo_name: 'evalphobia/serverless-github2slack',
      html_url: 'https://github.com/evalphobia/serverless-github2slack/issues/2',
      assignees: [],
      mentions: ['github', 'evalphobia'],
    }

    let tests = [{
      name: 'empty data',
      expected: {user: undefined, title: undefined, footer: undefined},
      user: 'hoge',
      data: {}
    }, {
      name: 'event.github.issues_create.json',
      expected: {user: 'evalphobia', title: undefined, footer: undefined},
      user: 'hoge',
      data: require('./event.github.issues_create.json')
    }, {
      name: 'default data',
      expected: {user: 'sender', title: 'title', footer: 'evalphobia/serverless-github2slack'},
      user: 'hoge',
      data: defaultData,
    }, ]

    const fn = slack.__get__('slackAttachData');
    tests.forEach(t => {
      test(t.name, () => {
        let result = fn(t.data, t.user)
        if (!!t.expected.user) {
          expect(result[0].author_name.login).toEqual(t.expected.user);
        } else {
          expect(result[0].author_name).toEqual(undefined);
        }
        expect(result[0].title).toEqual(t.expected.title);
        expect(result[0].footer).toEqual(t.expected.footer);
      });
    });
  })
})
