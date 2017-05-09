const config = require(`../config.json`)

/**
 * get gets value by the given key from environment or config json.
 *
 * @param {string} key - key name
 * @return {string|number|boolean|Array} - value
 */
function get(key) {
  return process.env[key] || config[key];
}

module.exports = {
  get: get,
}