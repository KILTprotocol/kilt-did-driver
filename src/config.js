/**
 * Copyright 2018-2024 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */

require('../envConfig')

// blockchain node, see options in .env files and npm scripts
const BLOCKCHAIN_NODE = process.env.KILT_BLOCKCHAIN_NODE
// server port
const PORT = 8080

module.exports = Object.freeze({
  BLOCKCHAIN_NODE,
  PORT
})
