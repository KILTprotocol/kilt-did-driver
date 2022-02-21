/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */

// did
const URI_DID = '/1.0/identifiers/:did'

const DID_RESOLUTION_RESPONSE_MIME =
  'application/ld+json;profile="https://w3id.org/did-resolution"'

const DID_DOC_CONTEXT = ['https://www.w3.org/ns/did/v1']
const DID_RESOLUTION_RESPONSE_CONTEXT = ['https://w3id.org/did-resolution/v1']

module.exports = {
  URI_DID,
  DID_RESOLUTION_RESPONSE_MIME,
  DID_RESOLUTION_RESPONSE_CONTEXT,
  DID_DOC_CONTEXT
}
