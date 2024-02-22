/**
 * Copyright (c) 2018-2024, Built on KILT.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */

const express = require('express')

const { connect } = require('@kiltprotocol/core')
const Did = require('@kiltprotocol/did')

const {
  W3C_DID_CONTEXT_URL,
  KILT_DID_CONTEXT_URL
} = require('@kiltprotocol/did')
const { PORT, BLOCKCHAIN_NODE } = require('./config')
const {
  URI_DID,
  DID_RESOLUTION_RESPONSE_MIME,
  DID_RESOLUTION_RESPONSE_CONTEXT
} = require('./consts')

const driver = express()

async function start() {
  const api = await connect(BLOCKCHAIN_NODE)

  // URI_DID is imposed by the universal-resolver
  driver.get(URI_DID, async (req, res) => {
    async function handleRequest(responseContentType) {
      const isJsonLd = responseContentType.includes('ld+json')
      let didDocument = null
      let didDocumentMetadata = {}
      let didResolutionMetadata = {}
      // Catch-all for generic error 500
      try {
        console.log('--------------------')
        console.info('\n→ Received headers:')
        console.info(JSON.stringify(req.headers, null, 2))
        const { did } = req.params

        // 1. resolve DID
        ;({ didDocument, didDocumentMetadata, didResolutionMetadata } =
          await Did.resolveCompliant(did))
        if (didDocument) {
          console.info('\n↑↓ Resolved DID details:')
          console.info(JSON.stringify(didDocument, null, 2))
          // expand VM references to full URI
          ;[
            'authentication',
            'assertionMethod',
            'capabilityDelegation',
            'keyAgreement'
          ].forEach((type) =>
            didDocument[type]?.forEach((id, idx) => {
              if (id.startsWith('#')) {
                didDocument[type][idx] = didDocument.id + id
              }
            })
          )
        }
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
        } else if (didDocumentMetadata.deactivated) {
          console.info(`\n❌ DID ${did} has been disabled`)
          // sending a 410 according to https://w3c-ccg.github.io/did-resolution/#bindings-https
          res.status(410)
        }

        // 3. build response according to requested MIME
        // add json-ld contexts to DID document if json-ld is requested
        if (didDocument && isJsonLd) {
          didDocument['@context'] = [W3C_DID_CONTEXT_URL, KILT_DID_CONTEXT_URL]
        }

        res.status(200)
      } catch (error) {
        console.error(
          '\n🚨 Could not satisfy request because of the following error:'
        )
        console.error(`${error}`)
        res.status(500)
        didDocument = null
        didDocumentMetadata = {}
        didResolutionMetadata = {
          error: 'internalError',
          errorMessage: String(error)
        }
      } finally {
        // create response body depending on MIME type
        let response
        if (responseContentType === DID_RESOLUTION_RESPONSE_MIME) {
          // case A: DID resolution result
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
          // case B: DID document only
          response = didDocument
        }

        console.info('\n← Responding with:')
        console.info(JSON.stringify(response, null, 2))

        res.contentType(responseContentType).send(response)
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

  const server = driver.listen(PORT, () => {
    console.info(
      `🚀 KILT DID resolver driver running on port ${PORT} and connected to ${BLOCKCHAIN_NODE}...`
    )
  })

  // graceful shutdown: stop accepting new requests -> wait for running requests to be completed -> close api connection and exit
  function shutdown(signal) {
    console.log(`${signal} signal received: closing HTTP server`)
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server')
    server.close(() => {
      console.log('HTTP server closed, closing api connection')
      api.disconnect().then(() => console.log('api connection closed'))
    })
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
  process.on('SIGQUIT', shutdown)
}

start()
