/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */

const express = require('express')

const { Did, init, connect } = require('@kiltprotocol/sdk-js')

const { PORT, BLOCKCHAIN_NODE } = require('./config')
const {
  URI_DID,
  DID_RESOLUTION_RESPONSE_MIME,
  DID_DOC_CONTEXT,
  DID_RESOLUTION_RESPONSE_CONTEXT
} = require('./consts')

const driver = express()

async function start() {
  await init({ address: BLOCKCHAIN_NODE })
  await connect()

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

        const didResolutionResult = {
          '@context': [DID_RESOLUTION_RESPONSE_CONTEXT],
          didDocument: null,
          didDocumentMetadata: {},
          didResolutionMetadata: {
            contentType: isJsonLd
              ? 'application/did+ld+json'
              : 'application/did+json'
          }
        }

        let resolvedDidDetails
        // Throws if the address is not a valid address
        try {
          resolvedDidDetails = await Did.resolveDoc(did)
          if (!resolvedDidDetails) {
            console.info(`\n🔍 DID ${did} not found (on chain)`)
            didResolutionResult.didResolutionMetadata.error = 'notFound'
            didResolutionResult.didResolutionMetadata.errorMessage = `DID ${did} not found (on chain)`
            res.status(404)
          } else {
            console.info('\n↑↓ Resolved DID details:')
            console.info(JSON.stringify(resolvedDidDetails, null, 2))
            didResolutionResult.didDocumentMetadata =
              resolvedDidDetails.metadata
          }
        } catch (error) {
          console.error('\n⚠️ Could not resolve DID with given error:')
          console.error(`${error}`)
          didResolutionResult.didResolutionMetadata.error = 'invalidDidUrl'
          didResolutionResult.didResolutionMetadata.errorMessage = error.message
          res.status(400)
        }

        // In case the DID has been deactivated, we return the minimum set of information,
        // which is represented by the sole `id` property.
        // https://www.w3.org/TR/did-core/#did-document-properties
        if (didResolutionResult.didDocumentMetadata.deactivated) {
          // sending a 410 according to https://w3c-ccg.github.io/did-resolution/#bindings-https
          res.status(410)
          didResolutionResult.didDocument = {
            id: did
          }
          if (isJsonLd) {
            didResolutionResult.didDocument['@context'] = [DID_DOC_CONTEXT]
          }
        } else if (resolvedDidDetails && resolvedDidDetails.details) {
          didResolutionResult.didDocument = Did.exportToDidDocument(
            resolvedDidDetails.details,
            isJsonLd ? 'application/ld+json' : 'application/json'
          )

          if (resolvedDidDetails.details instanceof Did.FullDidDetails) {
            // check for web3name
            const w3n = await Did.Web3Names.queryWeb3NameForDid(did)
            if (w3n) {
              didResolutionResult.didDocument.alsoKnownAs = [`w3n:${w3n}`]
            }
          }
        }

        const response =
          responseContentType === DID_RESOLUTION_RESPONSE_MIME
            ? didResolutionResult
            : didResolutionResult.didDocument

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
