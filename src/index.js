/**
 * Copyright 2018-2024 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */

const express = require('express')

const { DidResolver, connect } = require('@kiltprotocol/sdk-js')

const { PORT, BLOCKCHAIN_NODE } = require('./config')
const {
  URI_DID,
  DID_RESOLUTION_RESPONSE_MIME,
  DID_RESOLUTION_RESPONSE_CONTEXT
} = require('./consts')

const driver = express()

async function start() {
  await connect(BLOCKCHAIN_NODE)

  const decoder = new TextDecoder()

  // URI_DID is imposed by the universal-resolver
  driver.get(URI_DID, async (req, res) => {
    async function handleRequest(responseContentType) {
      let response
      // Catch-all for generic error 500
      try {
        console.log('--------------------')
        console.info('\n→ Received headers:')
        console.info(JSON.stringify(req.headers, null, 2))
        const { did } = req.params

        // 1. resolve DID
        const {
          didDocumentMetadata,
          didResolutionMetadata,
          didDocumentStream
        } = await DidResolver.resolveRepresentation(did, {
          accept:
            responseContentType === DID_RESOLUTION_RESPONSE_MIME
              ? 'application/did+ld+json'
              : responseContentType
        })
        if (didDocumentStream) {
          console.info(
            `\n↑↓ Resolved DID resource as ${didResolutionMetadata.contentType}`
          )
          if (didResolutionMetadata.contentType?.includes('json')) {
            console.info(decoder.decode(didDocumentStream))
          } else {
            console.info(`0x${Buffer.from(didDocumentStream).toString('hex')}`)
          }
        }
        // 2. set HTTP response code
        if (didResolutionMetadata.error) {
          switch (didResolutionMetadata.error) {
            case 'invalidDid':
              res.status(400)
              break
            case 'notFound':
              res.status(404)
              break
            case 'representationNotSupported':
              res.status(406)
              break
            case 'methodNotSupported':
              res.status(501)
              break
            case 'internalError':
            default:
              res.status(500)
          }
          if (didResolutionMetadata.error === 'notFound') {
            console.info(`\n🔍 DID ${did} not found (on chain)`)
          } else {
            console.error('\n⚠️ Could not resolve DID with given error:')
            console.error(
              `${didResolutionMetadata.error}: ${didResolutionMetadata.errorMessage}`
            )
          }
        } else if (didDocumentMetadata.deactivated) {
          console.info(`\n❌ DID ${did} has been disabled`)
          // sending a 410 according to https://w3c-ccg.github.io/did-resolution/#bindings-https
          res.status(410)
        } else {
          // set 200 status code
          res.status(200)
        }

        // create response body depending on MIME type
        if (responseContentType === DID_RESOLUTION_RESPONSE_MIME) {
          // case A: DID resolution result
          response = {
            '@context': [DID_RESOLUTION_RESPONSE_CONTEXT],
            didDocument: didDocumentStream
              ? JSON.parse(decoder.decode(didDocumentStream))
              : null,
            didDocumentMetadata,
            didResolutionMetadata
          }
        } else {
          // case B: DID document only
          response = didDocumentStream ? Buffer.from(didDocumentStream) : null
        }
      } catch (error) {
        console.error(
          '\n🚨 Could not satisfy request because of the following error:'
        )
        console.error(`${error}`)
        res.status(500)
        response = {
          didDocument: null,
          didDocumentMetadata: {},
          didResolutionMetadata: {
            error: 'internalError',
            errorMessage: String(error)
          }
        }
      } finally {
        console.info(
          `\n← Responding with content type ${responseContentType} and body:`
        )
        console.info(JSON.stringify(response))
        res.contentType(responseContentType).send(response)
        console.log('--------------------')
      }
    }
    // content negotiation; what do we return?
    res.format({
      [DID_RESOLUTION_RESPONSE_MIME]: () =>
        handleRequest(DID_RESOLUTION_RESPONSE_MIME),
      'application/did+ld+json': () => handleRequest('application/did+ld+json'),
      'application/did+json': () => handleRequest('application/did+json'),
      'application/json': () => handleRequest('application/did+json'),
      'application/did+cbor': () => handleRequest('application/did+cbor'),
      'application/cbor': () => handleRequest('application/did+cbor'),
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
