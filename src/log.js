const config = require('./config')

module.exports = {
  info: (msg) => {
    console.log('[INFO] ', msg);
  },
  error: (msg) => {
    console.error('[ERROR] ', msg);
  },
  debug: (msg) => {
    if (!!config.get('DEBUG_MODE')) {
      console.log('[DEBUG] ', msg);
    }
  }
}