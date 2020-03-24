const envConfig = require('../envConfig');

// blockchain node, see options in .env files and npm scripts
const BLOCKCHAIN_NODE = envConfig.KILT_BLOCKCHAIN_NODE;
// server port
const PORT = 8080;

module.exports = Object.freeze({
  BLOCKCHAIN_NODE,
  PORT,
});
