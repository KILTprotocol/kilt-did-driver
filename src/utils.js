/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */

const { DID_RESOLUTION_RESPONSE_MIME } = require("./consts")

function processAcceptHeaders(headers) {
    const acceptedTypes = new Set([...headers.split(',').map((c) => c.trim())])
    let exportType
    let defaultExport
    let responseContentType
    switch (true) {
        case acceptedTypes.has(DID_RESOLUTION_RESPONSE_MIME):
        case  acceptedTypes.has('*/*'):
        case acceptedTypes.size === 0:
            exportType = 'application/ld+json'
            defaultExport = { '@context': ['https://www.w3.org/ns/did/v1'] }
            responseContentType = DID_RESOLUTION_RESPONSE_MIME
            break;
        case acceptedTypes.has('application/did+ld+json'):
        case acceptedTypes.has('application/ld+json'):
            exportType = 'application/ld+json'
            defaultExport = { '@context': ['https://www.w3.org/ns/did/v1'] }
            responseContentType = 'application/did+ld+json'
            break;
        case acceptedTypes.has('application/did+json'):
        case acceptedTypes.has('application/json'):
            exportType = 'application/json'
            defaultExport = {}
            responseContentType = 'application/did+json'
            break;
        default:
            return {}
    }
    return {
        exportType,
        defaultExport,
        responseContentType
    }
}

module.exports = { processAcceptHeaders }