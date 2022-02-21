/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */

const express = require('express')

const { Did, init, connect } = require('@kiltprotocol/sdk-js')

const { PORT, BLOCKCHAIN_NODE } = require('./config')
const { URI_DID, DID_RESOLUTION_RESPONSE_MIME } = require('./consts')
const { processAcceptHeaders } = require('./utils')

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
      const { exportType, defaultExport, responseContentType } = processAcceptHeaders(req.headers.accept)
      if (!(exportType || responseContentType)) {
        console.error(`Received accept header with unsupported MIME type(s)`)
        res.sendStatus(406)
        return
      }
      const { did } = req.params
      // Add queried DID to default export for deleted resolutions
      defaultExport.id = did

      let didResolutionResult
      // Throws if the address is not a valid address
      try {
        didResolutionResult = await Did.resolveDoc(did)
      } catch (error) {
        console.error("\n⚠️ Could not resolve DID with given error:")
        console.error(JSON.stringify(error, null, 2))
        res.sendStatus(400)
        return
      }

      if (!didResolutionResult) {
        console.info(`\n🔍 DID ${did} not found (on chain)`)
        res.sendStatus(404)
        return
      }

      console.info('\n↑↓ Resolved DID details:')
      console.info(JSON.stringify(didResolutionResult, null, 2))

      // In case the DID has been deleted, we return the minimum set of information,
      // which is represented by the sole `id` property.
      // https://www.w3.org/TR/did-core/#did-document-properties
      const didDocument = didResolutionResult.details ?
        Did.exportToDidDocument(didResolutionResult.details, exportType) :
        defaultExport

      let response;

      if (responseContentType === DID_RESOLUTION_RESPONSE_MIME) {
        response = {
          didDocument,
          didDocumentMetadata: didResolutionResult.metadata,
          didResolutionMetadata: {}
        }
      } else {
        response = didDocument
      }

      console.info('\n← Responding with:')
      console.info(JSON.stringify(response, null, 2))

      res.contentType(responseContentType)
      res.send(response)
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