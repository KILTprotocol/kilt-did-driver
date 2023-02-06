/**
 * Copyright 2018-2023 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */

const express = require('express')

const { connect } = require('@kiltprotocol/core')
const Did = require('@kiltprotocol/did')

const { PORT, BLOCKCHAIN_NODE } = require('./config')
const {
  URI_DID,
  DID_RESOLUTION_RESPONSE_MIME,
  DID_DOC_CONTEXT,
  KILT_DID_CONTEXT,
  DID_RESOLUTION_RESPONSE_CONTEXT
} = require('./consts')

const driver = express()

async function start() {
  await connect(BLOCKCHAIN_NODE)

  // URI_DID is imposed by the universal-resolver
  driver.get(URI_DID, async (req, res) => {
    async function handleRequest(responseContentType) {
      const isJsonLd = responseContentType.includes('ld+json')
      // Catch-all for generic error 500
      try {
        console.log('--------------------')
        console.info('\n→ Received headers:')
        console.info(JSON.stringify(req.headers, null, 2))
        const { did } = req.params

        // 1. resolve DID
        const { didDocument, didDocumentMetadata, didResolutionMetadata } =
          await Did.resolveCompliant(did)

        // 2. set HTTP response code
        if (didResolutionMetadata.error === 'notFound') {
          console.info(`\n🔍 DID ${did} not found (on chain)`)
          res.status(404)
        } else if (didResolutionMetadata.error) {
          console.error('\n⚠️ Could not resolve DID with given error:')
          console.error(
            `${didResolutionMetadata.error}: ${didResolutionMetadata.errorMessage}`
          )
          res.status(400)
        } else if (didDocument) {
          console.info('\n↑↓ Resolved DID details:')
          console.info(JSON.stringify(didDocument, null, 2))
        }

        if (didDocumentMetadata.deactivated) {
          // sending a 410 according to https://w3c-ccg.github.io/did-resolution/#bindings-https
          res.status(410)
        }

        // 3. build response according to requested MIME

        // add json-ld contexts if json-ld is requested
        if (didDocument && isJsonLd) {
          didDocument['@context'] = [DID_DOC_CONTEXT, KILT_DID_CONTEXT]
        }

        let response
        if (responseContentType === DID_RESOLUTION_RESPONSE_MIME) {
          response = {
            '@context': [DID_RESOLUTION_RESPONSE_CONTEXT],
            didDocument,
            didDocumentMetadata,
            didResolutionMetadata: {
              ...didResolutionMetadata,
              contentType: isJsonLd
                ? 'application/did+ld+json'
                : 'application/did+json'
            }
          }
        } else {
          response = didDocument
        }

        console.info('\n← Responding with:')
        console.info(JSON.stringify(response, null, 2))

        res.contentType(responseContentType).send(response)
      } catch (error) {
        console.error(
          '\n🚨 Could not satisfy request because of the following error:'
        )
        console.error(`${error}`)
        res.sendStatus(500)
      } finally {
        console.log('--------------------')
      }
    }
    // content negotiation; what do we return?
    res.format({
      [DID_RESOLUTION_RESPONSE_MIME]: () =>
        handleRequest(DID_RESOLUTION_RESPONSE_MIME),
      'application/ld+json': () => handleRequest('application/did+ld+json'),
      'application/did+ld+json': () => handleRequest('application/did+ld+json'),
      'application/json': () => handleRequest('application/did+json'),
      'application/did+json': () => handleRequest('application/did+json'),
      default: () => {
        const message = `Not acceptable media type(s) ${req.headers.accept}`
        console.error(`Error: ${message}`)
        res.status(406).send(message)
      }
    })
  })

  driver.listen(PORT, () => {
    console.info(
      `🚀 KILT DID resolver driver running on port ${PORT} and connected to ${BLOCKCHAIN_NODE}...`
    )
  })
}

start()
