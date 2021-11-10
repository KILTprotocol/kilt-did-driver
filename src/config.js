require('../envConfig')

// blockchain node, see options in .env files and npm scripts
const BLOCKCHAIN_NODE = process.env.KILT_BLOCKCHAIN_NODE
// server port
const PORT = process.env.SERVICE_PORT

module.exports = Object.freeze({
  BLOCKCHAIN_NODE,
  PORT
})
