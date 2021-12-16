/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */

function processAcceptHeaders(headers) {
    const acceptedTypes = new Set([...headers.split(',').map((c) => c.trim())])
    let exportType
    let defaultExport
    let responseContentType
    if (acceptedTypes.has('application/did+json')) {
        exportType = 'application/json'
        defaultExport = {}
        responseContentType = 'application/did+json'
    } else {
        exportType = 'application/ld+json'
        defaultExport = { '@context': ['https://www.w3.org/ns/did/v1'] }
        responseContentType = 'application/did+ld+json'
    }
    return {
        exportType,
        defaultExport,
        responseContentType
    }
}

module.exports = { processAcceptHeaders }