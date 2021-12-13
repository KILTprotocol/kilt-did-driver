/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */

const express = require('express')

const { Did, init, connect } = require('@kiltprotocol/sdk-js')

const { PORT, BLOCKCHAIN_NODE } = require('./config')
const { URI_DID } = require('./consts')

const driver = express()

async function start() {
  await init({ address: BLOCKCHAIN_NODE })
  await connect()

  // URI_DID is imposed by the universal-resolver
  driver.get(URI_DID, async (req, res) => {
    // Catch-all for generic error 500
    try {
      console.log('--------------------')
      console.info('\n→ Received headers:')
      console.info(JSON.stringify(req.headers, null, 2))
      const { did } = req.params

      let didResolutionResult
      // Throws if the address is not a valid address
      try {
        didResolutionResult = await Did.resolveDoc(did)
      } catch(error) {
        console.info("\n⚠️ Could not resolve DID with given error:")
        console.info(JSON.stringify(error, null, 2))
        res.sendStatus(400)
        return
      }

      if (!didResolutionResult) {
        console.trace(`\n🔍 DID ${did} not found (on chain)`)
        res.sendStatus(404)
        return
      }

      console.trace('\n↑↓ Resolved DID details:')
      console.trace(JSON.stringify(didResolutionResult, null, 2))

      // In case the DID has been deleted, we return the minimum set of information,
      // which is represented by the sole `id` property.
      // https://www.w3.org/TR/did-core/#did-document-properties
      const didDocument = didResolutionResult.details ?
        Did.exportToDidDocument(didResolutionResult.details, 'application/ld+json') :
        { id: did, '@context': ['https://www.w3.org/ns/did/v1'] }

      const exportedDidDocument = {
        didDocument,
        didDocumentMetadata: didResolutionResult.metadata
      }

      console.trace('\n← Exported DID document:')
      console.trace(JSON.stringify(exportedDidDocument, null, 2))

      res.send(exportedDidDocument)
    } catch (error) {
      console.error("\n🚨 Could not satisfy request because of the following error:")
      console.error(JSON.stringify(error, null, 2))
      res.sendStatus(500)
    } finally {
      console.log('--------------------')
    }
  })

  driver.listen(PORT, () => {
    console.info(`🚀 KILT DID resolver driver running on port ${PORT} and connected to ${BLOCKCHAIN_NODE}...`)
  })
}

start()