import rewire from 'rewire';
import path from 'path';
const converter = rewire(path.join(__dirname, '../src/converter'))
const env = Object.assign({}, process.env);

describe('converter', () => {

  describe('convert', () => {
    test('empty data', () => {
      let result = converter.convert('hoge', {})
      expect(result.is_valid_event).toEqual(false);
    });
    test('issue_create', () => {
      const eventName = 'issues'
      let data = require('./event.github.issues_create.json')
      let converter = require('../src/converter');
      let result = converter.convert(eventName, data)

      expect(result.eventName).toEqual(eventName);
      expect(result.action).toEqual('opened');
      expect(result.is_valid_event).toEqual(true);
      expect(result.is_merged).toEqual(false);
      expect(result.sender).toEqual('evalphobia');
      expect(result.owner).toEqual('evalphobia');
      expect(result.creator).toEqual('evalphobia');
      expect(result.title).toEqual('test');
      expect(result.body).toEqual('@github @evalphobia plz fix this issue');
      expect(result.repo_name).toEqual('evalphobia/serverless-github2slack');
      expect(result.html_url).toEqual('https://github.com/evalphobia/serverless-github2slack/issues/2');
      expect(result.assignee).toBeUndefined();
      expect(result.assignees).toEqual([]);
      expect(result.mentions).toEqual(['github', 'evalphobia']);
    });
  })

  describe('isValidEvent', () => {
    let tests = [{
      name: 'empty data',
      expected: false,
      eventName: '',
      data: {}
    }, {
      name: 'issue_create',
      expected: true,
      eventName: 'issues',
      data: require('./event.github.issues_create.json')
    }, ]

    const fn = converter.__get__('isValidEvent');
    tests.forEach(t => {
      test(t.name, () => {
        let result = fn(t.eventName, t.data)
        expect(result).toEqual(t.expected);
      });
    });
  })

  describe('isValidAction', () => {
    let tests = [{
      name: 'empty data',
      expected: true,
      data: {}
    }, {
      name: 'issue_create',
      expected: true,
      data: require('./event.github.issues_create.json')
    }, {
      name: 'synchronize',
      expected: false,
      data: {
        action: 'synchronize'
      }
    }, ]


    const fn = converter.__get__('isValidAction');
    tests.forEach(t => {
      test(t.name, () => {
        let result = fn(t.data)
        expect(result).toEqual(t.expected);
      });
    });
  })

  describe('isMerged', () => {
    let tests = [{
      name: 'empty data',
      expected: false,
      data: {}
    }, {
      name: 'issue_create',
      expected: false,
      data: require('./event.github.issues_create.json')
    }, {
      name: 'pull_request merged false',
      expected: false,
      data: {
        pull_request: {
          merged: false
        },
      }
    }, {
      name: 'pull_request merged true',
      expected: true,
      data: {
        pull_request: {
          merged: true
        },
      }
    }, ]

    const fn = converter.__get__('isMerged');
    tests.forEach(t => {
      test(t.name, () => {
        let result = fn(t.data)
        expect(result).toEqual(t.expected);
      });
    });
  })

  describe('getRepoName', () => {
    let tests = [{
      name: 'empty data',
      expected: undefined,
      data: {}
    }, {
      name: 'issue_create',
      expected: 'evalphobia/serverless-github2slack',
      data: require('./event.github.issues_create.json')
    }, {
      name: 'repository',
      expected: undefined,
      data: {
        repository: {},
      }
    }, {
      name: 'repository and full_name',
      expected: 'repo_name',
      data: {
        repository: {
          full_name: 'repo_name'
        },
      }
    }, ]

    const fn = converter.__get__('getRepoName');
    tests.forEach(t => {
      test(t.name, () => {
        let result = fn(t.data)
        expect(result).toEqual(t.expected);
      });
    });
  })

  describe('getHtmlUrl', () => {
    let defaultData = {
      issue: {
        html_url: 'issue'
      },
      comment: {
        html_url: 'comment'
      },
      pull_request: {
        html_url: 'pull_request'
      },
    }
    let tests = [{
      name: 'empty data',
      expected: 'unknown',
      eventName: '',
      data: {}
    }, {
      name: 'issue_create',
      expected: 'https://github.com/evalphobia/serverless-github2slack/issues/2',
      eventName: 'issues',
      data: require('./event.github.issues_create.json')
    }, {
      name: 'empty issue',
      expected: undefined,
      eventName: 'issues',
      data: {
        issue: {},
      }
    }, {
      name: 'issue',
      expected: 'issue',
      eventName: 'issues',
      data: defaultData,
    }, {
      name: 'pull_request',
      expected: 'pull_request',
      eventName: 'pull_request',
      data: defaultData,
    }, {
      name: 'issue_comment',
      expected: 'comment',
      eventName: 'issue_comment',
      data: defaultData,
    }, {
      name: 'pull_request_review_comment',
      expected: 'comment',
      eventName: 'pull_request_review_comment',
      data: defaultData,
    }, ]

    const fn = converter.__get__('getHtmlUrl');
    tests.forEach(t => {
      test(t.name, () => {
        let result = fn(t.eventName, t.data)
        expect(result).toEqual(t.expected);
      });
    });
  })

  describe('getTitle', () => {
    let defaultData = {
      issue: {
        title: 'issue'
      },
      pull_request: {
        title: 'pull_request'
      },
    }
    let tests = [{
      name: 'empty data',
      expected: 'unknown event',
      eventName: '',
      data: {}
    }, {
      name: 'issue_create',
      expected: 'test',
      eventName: 'issues',
      data: require('./event.github.issues_create.json')
    }, {
      name: 'empty issue',
      expected: undefined,
      eventName: 'issues',
      data: {
        issue: {},
      }
    }, {
      name: 'issue',
      expected: 'issue',
      eventName: 'issues',
      data: defaultData,
    }, {
      name: 'pull_request',
      expected: 'pull_request',
      eventName: 'pull_request',
      data: defaultData,
    }, {
      name: 'issue_comment',
      expected: 'issue',
      eventName: 'issue_comment',
      data: defaultData,
    }, {
      name: 'pull_request_review_comment',
      expected: 'pull_request',
      eventName: 'pull_request_review_comment',
      data: defaultData,
    }, ]

    const fn = converter.__get__('getTitle');
    tests.forEach(t => {
      test(t.name, () => {
        let result = fn(t.eventName, t.data)
        expect(result).toEqual(t.expected);
      });
    });
  })

  describe('getBody', () => {
    let defaultData = {
      issue: {
        body: 'issue'
      },
      comment: {
        body: 'comment'
      },
      pull_request: {
        body: 'pull_request'
      },
    }

    let tests = [{
      name: 'empty data',
      expected: 'unknown event',
      eventName: '',
      data: {}
    }, {
      name: 'issue_create',
      expected: '@github @evalphobia plz fix this issue',
      eventName: 'issues',
      data: require('./event.github.issues_create.json')
    }, {
      name: 'empty issue',
      expected: undefined,
      eventName: 'issues',
      data: {
        issue: {},
      }
    }, {
      name: 'issue',
      expected: 'issue',
      eventName: 'issues',
      data: defaultData,
    }, {
      name: 'pull_request',
      expected: 'pull_request',
      eventName: 'pull_request',
      data: defaultData,
    }, {
      name: 'issue_comment',
      expected: 'comment',
      eventName: 'issue_comment',
      data: defaultData,
    }, {
      name: 'pull_request_review_comment',
      expected: 'comment',
      eventName: 'pull_request_review_comment',
      data: defaultData,
    }, {
      name: 'issue:closed',
      expected: '',
      eventName: 'issues',
      data: Object.assign({
        action: 'closed'
      }, defaultData),
    }, {
      name: 'issue:labeled',
      expected: '',
      eventName: 'issues',
      data: Object.assign({
        action: 'labeled'
      }, defaultData),
    }, {
      name: 'issue:unlabeled',
      expected: '',
      eventName: 'issues',
      data: Object.assign({
        action: 'unlabeled'
      }, defaultData),
    }, ]

    const fn = converter.__get__('getBody');
    tests.forEach(t => {
      test(t.name, () => {
        let result = fn(t.eventName, t.data)
        expect(result).toEqual(t.expected);
      });
    });
  })

  describe('getSender', () => {
    let tests = [{
      name: 'empty data',
      expected: undefined,
      data: {}
    }, {
      name: 'event.github.issues_create.json',
      expected: 'evalphobia',
      data: require('./event.github.issues_create.json')
    }, {
      name: 'sender null',
      expected: undefined,
      data: {
        sender: null
      },
    }, {
      name: 'sender',
      expected: 'name',
      data: {
        sender: {
          login: 'name'
        },
      },
    }, ]

    const fn = converter.__get__('getSender');
    tests.forEach(t => {
      test(t.name, () => {
        let result = fn(t.data)
        expect(result).toEqual(t.expected);
      });
    });
  })

  describe('getOwner', () => {
    let tests = [{
      name: 'empty data',
      expected: undefined,
      data: {}
    }, {
      name: 'event.github.issues_create.json',
      expected: 'evalphobia',
      data: require('./event.github.issues_create.json')
    }, {
      name: 'owner null',
      expected: undefined,
      data: {
        repository: {},
      },
    }, {
      name: 'owner',
      expected: 'name',
      data: {
        repository: {
          owner: {
            login: 'name'
          }
        },
      },
    }, ]

    const fn = converter.__get__('getOwner');
    tests.forEach(t => {
      test(t.name, () => {
        let result = fn(t.data)
        expect(result).toEqual(t.expected);
      });
    });
  })

  describe('getCreator', () => {
    let defaultData = {
      issue: {
        user: {
          login: 'issue'
        }
      },
      pull_request: {
        user: {
          login: 'pull_request'
        }
      },
    }

    let tests = [{
      name: 'empty data',
      expected: undefined,
      data: {}
    }, {
      name: 'event.github.issues_create.json',
      expected: 'evalphobia',
      data: require('./event.github.issues_create.json')
    }, {
      name: 'issue isIssue',
      expected: 'issue',
      data: Object.assign({
        isIssue: true
      }, defaultData),
    }, {
      name: 'issue not isIssue',
      expected: undefined,
      data: defaultData,
    }, {
      name: 'pull_request isPullRequest',
      expected: 'pull_request',
      data: Object.assign({
        isPullRequest: true
      }, defaultData),
    }, ]

    const fn = converter.__get__('getCreator');
    tests.forEach(t => {
      test(t.name, () => {
        let result = fn(t.data)
        expect(result).toEqual(t.expected);
      });
    });
  })

  describe('getAssignee', () => {
    let defaultData = {
      issue: {
        assignee: {
          login: 'issue'
        }
      },
      pull_request: {
        assignee: {
          login: 'pull_request'
        }
      },
    }

    let tests = [{
      name: 'empty data',
      expected: undefined,
      data: {}
    }, {
      name: 'event.github.issues_create.json',
      expected: undefined,
      data: require('./event.github.issues_create.json')
    }, {
      name: 'issue isIssue',
      expected: 'issue',
      data: Object.assign({
        isIssue: true
      }, defaultData),
    }, {
      name: 'issue not isIssue',
      expected: undefined,
      data: defaultData,
    }, {
      name: 'pull_request isPullRequest',
      expected: 'pull_request',
      data: Object.assign({
        isPullRequest: true
      }, defaultData),
    }, ]

    const fn = converter.__get__('getAssignee');
    tests.forEach(t => {
      test(t.name, () => {
        let result = fn(t.data)
        expect(result).toEqual(t.expected);
      });
    });
  })

  describe('getAssignees', () => {
    let defaultData = {
      issue: {
        assignees: [{
          login: 'issue'
        }]
      },
      pull_request: {
        assignees: [{
          login: 'pull_request1'
        }, {
          login: 'pull_request2'
        }]
      },
    }

    let tests = [{
      name: 'empty data',
      expected: [],
      data: {}
    }, {
      name: 'event.github.issues_create.json',
      expected: [],
      data: require('./event.github.issues_create.json')
    }, {
      name: 'issue isIssue',
      expected: ['issue'],
      data: Object.assign({
        isIssue: true
      }, defaultData),
    }, {
      name: 'issue not isIssue',
      expected: [],
      data: defaultData,
    }, {
      name: 'pull_request isPullRequest',
      expected: ['pull_request1', 'pull_request2'],
      data: Object.assign({
        isPullRequest: true
      }, defaultData),
    }, ]

    const fn = converter.__get__('getAssignees');
    tests.forEach(t => {
      test(t.name, () => {
        let result = fn(t.data)
        expect(result).toEqual(t.expected);
      });
    });
  })

  describe('_getAssignees', () => {
    let defaultData = {
      issue: {
        assignees: [{
          login: 'issue'
        }]
      },
      pull_request: {
        assignees: [{
          login: 'pull_request1'
        }, {
          login: 'pull_request2'
        }]
      },
    }

    let tests = [{
      name: 'empty data',
      expected: [],
      data: {}
    }, {
      name: 'event.github.issues_create.json',
      expected: [],
      data: require('./event.github.issues_create.json')
    }, {
      name: 'issue isIssue',
      expected: defaultData.issue.assignees,
      data: Object.assign({
        isIssue: true
      }, defaultData),
    }, {
      name: 'issue not isIssue',
      expected: [],
      data: defaultData,
    }, {
      name: 'pull_request isPullRequest',
      expected: defaultData.pull_request.assignees,
      data: Object.assign({
        isPullRequest: true
      }, defaultData),
    }, ]

    const fn = converter.__get__('_getAssignees');
    tests.forEach(t => {
      test(t.name, () => {
        let result = fn(t.data)
        expect(result).toEqual(t.expected);
      });
    });
  })

  describe('getMentions', () => {
    let defaultData = {
      issue: {
        body: 'issue @evalphobia @foo @bar'
      },
      comment: {
        body: '@foo comment'
      },
      pull_request: {
        body: 'pull_request @foo comment @bar@bar @bar @bar'
      },
    }

    let tests = [{
      name: 'empty data',
      expected: [],
      eventName: '',
      data: {}
    }, {
      name: 'issue_create',
      expected: ['github', 'evalphobia'],
      eventName: 'issues',
      data: require('./event.github.issues_create.json')
    }, {
      name: 'empty issue',
      expected: [],
      eventName: 'issues',
      data: {
        issue: {},
      }
    }, {
      name: 'issue',
      expected: ['evalphobia', 'foo', 'bar'],
      eventName: 'issues',
      data: defaultData,
    }, {
      name: 'pull_request',
      expected: ['foo', 'bar', 'bar', 'bar', 'bar'],
      eventName: 'pull_request',
      data: defaultData,
    }, {
      name: 'issue_comment',
      expected: ['foo'],
      eventName: 'issue_comment',
      data: defaultData,
    }, {
      name: 'pull_request_review_comment',
      expected: ['foo'],
      eventName: 'pull_request_review_comment',
      data: defaultData,
    }, ]

    const fn = converter.__get__('getMentions');
    tests.forEach(t => {
      test(t.name, () => {
        let result = fn(t.eventName, t.data)
        expect(result).toEqual(t.expected);
      });
    });
  })
})