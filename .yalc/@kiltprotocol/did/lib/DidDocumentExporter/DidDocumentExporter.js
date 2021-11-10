"use strict";
/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DidDocumentExporter = exports.exportToDidDocument = void 0;
/**
 * @packageDocumentation
 * @module DID
 */
const util_crypto_1 = require("@polkadot/util-crypto");
const util_1 = require("@polkadot/util");
const types_1 = require("@kiltprotocol/types");
function exportToJsonDidDocument(details) {
    const result = {};
    result.id = details.did;
    result.verificationMethod = new Array();
    // Populate the `verificationMethod` array and then sets the `authentication` array with the key IDs (or undefined if no auth key is present - which should never happen)
    const authenticationKeysIds = details
        .getKeys(types_1.KeyRelationship.authentication)
        .map((authKey) => {
        result.verificationMethod.push({
            id: authKey.id,
            controller: details.did,
            type: types_1.VerificationKeyTypesMap[authKey.type],
            publicKeyBase58: util_crypto_1.base58Encode(util_1.hexToU8a(authKey.publicKeyHex)),
        });
        // Parse only the key ID from the complete key URI
        return authKey.id;
    });
    if (authenticationKeysIds.length) {
        result.authentication = authenticationKeysIds;
    }
    const keyAgreementKeysIds = details
        .getKeys(types_1.KeyRelationship.keyAgreement)
        .map((keyAgrKey) => {
        result.verificationMethod.push({
            id: keyAgrKey.id,
            controller: details.did,
            type: types_1.EncryptionKeyTypesMap[keyAgrKey.type],
            publicKeyBase58: util_crypto_1.base58Encode(util_1.hexToU8a(keyAgrKey.publicKeyHex)),
        });
        return keyAgrKey.id;
    });
    if (keyAgreementKeysIds.length) {
        result.keyAgreement = keyAgreementKeysIds;
    }
    const assertionKeysIds = details
        .getKeys(types_1.KeyRelationship.assertionMethod)
        .map((assKey) => {
        result.verificationMethod.push({
            id: assKey.id,
            controller: details.did,
            type: types_1.VerificationKeyTypesMap[assKey.type],
            publicKeyBase58: util_crypto_1.base58Encode(util_1.hexToU8a(assKey.publicKeyHex)),
        });
        return assKey.id;
    });
    if (assertionKeysIds.length) {
        result.assertionMethod = assertionKeysIds;
    }
    const delegationKeyIds = details
        .getKeys(types_1.KeyRelationship.capabilityDelegation)
        .map((delKey) => {
        result.verificationMethod.push({
            id: delKey.id,
            controller: details.did,
            type: types_1.VerificationKeyTypesMap[delKey.type],
            publicKeyBase58: util_crypto_1.base58Encode(util_1.hexToU8a(delKey.publicKeyHex)),
        });
        return delKey.id;
    });
    if (delegationKeyIds.length) {
        result.capabilityDelegation = delegationKeyIds;
    }
    const serviceEndpoints = details.getEndpoints();
    if (serviceEndpoints.length) {
        result.service = serviceEndpoints.map((service) => {
            return {
                id: service.id,
                type: service.types,
                serviceEndpoints: service.urls,
            };
        });
    }
    return result;
}
function exportToJsonLdDidDocument(details) {
    const document = exportToJsonDidDocument(details);
    document['@context'] = ['https://www.w3.org/ns/did/v1'];
    return document;
}
/**
 * Export an instance of [[IDidDetails]] to a W3c-compliant DID Document in the format provided.
 *
 * @param details The [[IDidDetails]] instance.
 * @param mimeType The format for the output DID Document. Accepted values are `application/json` and `application/ld+json`.
 * @returns The DID Document formatted according to the mime type provided, or an error if the format specified is not supported.
 */
function exportToDidDocument(details, mimeType) {
    switch (mimeType) {
        case 'application/json':
            return exportToJsonDidDocument(details);
        case 'application/ld+json':
            return exportToJsonLdDidDocument(details);
        default:
            throw new Error(`${mimeType} not supported by any of the available exporters.`);
    }
}
exports.exportToDidDocument = exportToDidDocument;
exports.DidDocumentExporter = { exportToDidDocument };
