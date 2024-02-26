/**
 * Copyright (c) 2018-2024, Built on KILT.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */

require('../envConfig')

// blockchain node, see options in .env files and npm scripts
const BLOCKCHAIN_NODE = process.env.KILT_BLOCKCHAIN_NODE
// server port
const PORT = 8080
// grace period in ms
const SHUTDOWN_GRACE_PERIOD = 5000

module.exports = Object.freeze({
  BLOCKCHAIN_NODE,
  PORT,
  SHUTDOWN_GRACE_PERIOD
})
