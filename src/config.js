const envConfig = require('../envConfig');

// blockchain node
const BLOCKCHAIN_NODE = envConfig.KILT_BLOCKCHAIN_NODE;
// server
const PORT = 8080;

module.exports = Object.freeze({
  BLOCKCHAIN_NODE,
  PORT,
});
