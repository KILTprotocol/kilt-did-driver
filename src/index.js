/* eslint-disable no-restricted-syntax */

const express = require('express')

const { Did, init } = require('@kiltprotocol/sdk-js')

const { PORT, BLOCKCHAIN_NODE } = require('./config')
const { URI_DID } = require('./consts')

const driver = express()

async function start() {
  await init({ address: BLOCKCHAIN_NODE })

  // URI_DID is imposed by the universal-resolver
  driver.get(URI_DID, async (req, res) => {
    // Catch-all for generic error 500
    try {
      console.log('--------------------')
      console.info('\n→ Received headers:')
      console.info(JSON.stringify(req.headers, null, 2))
      const { did } = req.params

      let didResolutionResult
      // Throws if the address is not a valid checksum address
      try {
        didResolutionResult = await Did.resolveDoc(did)
      } catch(error) {
        console.debug("\n⚠️ Could not resolve DID with given error:")
        console.debug(JSON.stringify(error, null, 2))
        res.sendStatus(400)
        return
      }

      if (!didResolutionResult) {
        console.trace(`\n🔍 DID ${did} not found (on chain)`)
        res.sendStatus(404)
        return
      }

      console.log(didResolutionResult)

      console.trace('\n↑↓ Resolved DID details:')
      console.trace(JSON.stringify(didResolutionResult, null, 2))

      let exportedDidDocument = Did.exportToDidDocument(didResolutionResult.details, 'application/ld+json')

      if (didResolutionResult.metadata) {
        exportedDidDocument = {
          didDocument: exportedDidDocument,
          didDocumentMetadata: didResolutionResult.metadata
        }
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