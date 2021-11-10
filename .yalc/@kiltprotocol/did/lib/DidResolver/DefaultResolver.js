"use strict";
/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultResolver = exports.resolve = exports.resolveServiceEndpoint = exports.resolveKey = exports.resolveDoc = void 0;
const types_1 = require("@kiltprotocol/types");
const utils_1 = require("@kiltprotocol/utils");
const LightDidDetails_1 = require("../DidDetails/LightDidDetails");
const FullDidDetails_1 = require("../DidDetails/FullDidDetails");
const LightDidDetails_utils_1 = require("../DidDetails/LightDidDetails.utils");
const Did_chain_1 = require("../Did.chain");
const Did_utils_1 = require("../Did.utils");
/**
 * Retrieves all the details associated with a DID from the KILT blockchain.
 *
 * @param identifier The full DID identifier.
 * @param version The DID version number.
 * @returns The full DID details queried from the KILT blockchain.
 */
async function queryFullDetailsFromIdentifier(identifier, version = FullDidDetails_1.FullDidDetails.FULL_DID_LATEST_VERSION) {
    const didRec = await Did_chain_1.queryById(identifier);
    if (!didRec)
        return null;
    const { publicKeys, assertionMethodKey, authenticationKey, capabilityDelegationKey, keyAgreementKeys, lastTxCounter, } = didRec;
    const keyRelationships = {
        [types_1.KeyRelationship.authentication]: [authenticationKey],
        [types_1.KeyRelationship.keyAgreement]: keyAgreementKeys,
    };
    if (assertionMethodKey) {
        keyRelationships[types_1.KeyRelationship.assertionMethod] = [assertionMethodKey];
    }
    if (capabilityDelegationKey) {
        keyRelationships[types_1.KeyRelationship.capabilityDelegation] = [
            capabilityDelegationKey,
        ];
    }
    const didUri = Did_utils_1.getKiltDidFromIdentifier(identifier, 'full', version);
    const endpoints = await Did_chain_1.queryServiceEndpoints(didUri);
    return new FullDidDetails_1.FullDidDetails({
        did: didUri,
        keys: publicKeys,
        keyRelationships,
        lastTxIndex: lastTxCounter.toBn(),
        serviceEndpoints: endpoints,
    });
}
function buildLightDetailsFromUriRegexMatch({ identifier, version, encodedDetails, }) {
    // In light DIDs the key type encoding (first two chars) is part of the identifier.
    // We are sure the URI follows the expected structure as it has been checked in `parseDidUrl`.
    const keyTypeEncoding = identifier.substring(0, 2);
    const keyType = Did_utils_1.getSigningKeyTypeFromEncoding(keyTypeEncoding);
    if (!keyType) {
        throw Error();
    }
    const kiltIdentifier = identifier.substring(2);
    const lightDidCreationOptions = {
        authenticationKey: {
            publicKey: utils_1.Crypto.decodeAddress(kiltIdentifier, true, 38),
            type: keyType,
        },
    };
    if (encodedDetails) {
        const decodedDetails = LightDidDetails_utils_1.decodeAndDeserializeAdditionalLightDidDetails(encodedDetails, version);
        lightDidCreationOptions.encryptionKey = decodedDetails.encryptionKey;
        lightDidCreationOptions.serviceEndpoints = decodedDetails.serviceEndpoints;
    }
    return new LightDidDetails_1.LightDidDetails(lightDidCreationOptions);
}
/**
 * Resolve a DID URI to the details of the DID subject.
 *
 * The URI can also identify a key or a service, but it will be ignored during resolution.
 *
 * @param did The subject's identifier.
 * @returns The details associated with the DID subject.
 */
async function resolveDoc(did) {
    const { identifier, type, version, encodedDetails } = Did_utils_1.parseDidUrl(did);
    switch (type) {
        case 'full': {
            const details = await queryFullDetailsFromIdentifier(identifier, version);
            // If the details are found, return those details.
            if (details) {
                return {
                    details,
                    metadata: {
                        deactivated: false,
                    },
                };
            }
            // If not, check whether the DID has been deleted or simply does not exist.
            const isDeactivated = await Did_chain_1.queryDidDeletionStatus(did);
            if (isDeactivated) {
                return {
                    metadata: {
                        deactivated: true,
                    },
                };
            }
            return null;
        }
        case 'light': {
            let details;
            try {
                details = buildLightDetailsFromUriRegexMatch({
                    identifier,
                    version,
                    encodedDetails,
                });
            }
            catch (_a) {
                throw utils_1.SDKErrors.ERROR_INVALID_DID_FORMAT(did);
            }
            // LightDID identifier has two leading characters indicating the authentication key type.
            const fullDidIdentifier = identifier.substring(2);
            const fullDidUri = Did_utils_1.getKiltDidFromIdentifier(fullDidIdentifier, 'full');
            const fullDidDetails = await queryFullDetailsFromIdentifier(fullDidIdentifier);
            // If a full DID with same identifier is present, return the resolution metadata accordingly.
            if (fullDidDetails) {
                return {
                    details,
                    metadata: {
                        canonicalId: fullDidUri,
                        deactivated: false,
                    },
                };
            }
            // If no full DID details are found but the full DID has been deleted, return the info in the resolution metadata.
            const isFullDidDeleted = await Did_chain_1.queryDidDeletionStatus(fullDidUri);
            if (isFullDidDeleted) {
                return {
                    // No canonicalId and no details are returned as we consider this DID deactivated/deleted.
                    metadata: {
                        deactivated: true,
                    },
                };
            }
            // If no full DID details nor deletion info is found, the light DID is un-migrated.
            // Metadata will simply contain `deactivated: false`.
            return {
                details,
                metadata: {
                    deactivated: false,
                },
            };
        }
        default:
            throw utils_1.SDKErrors.ERROR_UNSUPPORTED_DID(did);
    }
}
exports.resolveDoc = resolveDoc;
/**
 * Resolve a DID key URI to the key details.
 *
 * @param didUri The DID key URI.
 * @returns The details associated with the key.
 */
async function resolveKey(didUri) {
    var _a;
    const { fragment, type } = Did_utils_1.parseDidUrl(didUri);
    // A fragment IS expected to resolve a key.
    if (!fragment) {
        throw utils_1.SDKErrors.ERROR_INVALID_DID_FORMAT;
    }
    switch (type) {
        case 'full':
            return Did_chain_1.queryDidKey(didUri);
        case 'light': {
            const resolvedDetails = await resolveDoc(didUri);
            if (!resolvedDetails) {
                throw utils_1.SDKErrors.ERROR_INVALID_DID_FORMAT(didUri);
            }
            return ((_a = resolvedDetails.details) === null || _a === void 0 ? void 0 : _a.getKey(didUri)) || null;
        }
        default:
            throw utils_1.SDKErrors.ERROR_UNSUPPORTED_DID(didUri);
    }
}
exports.resolveKey = resolveKey;
/**
 * Resolve a DID service URI to the service details.
 *
 * @param didUri The DID service URI.
 * @returns The details associated with the service endpoint.
 */
async function resolveServiceEndpoint(didUri) {
    var _a;
    const { fragment, type } = Did_utils_1.parseDidUrl(didUri);
    // A fragment IS expected to resolve a service endpoint.
    if (!fragment) {
        throw utils_1.SDKErrors.ERROR_INVALID_DID_FORMAT;
    }
    switch (type) {
        case 'full': {
            return Did_chain_1.queryServiceEndpoint(didUri);
        }
        case 'light': {
            const resolvedDetails = await resolveDoc(didUri);
            if (!resolvedDetails) {
                throw utils_1.SDKErrors.ERROR_INVALID_DID_FORMAT(didUri);
            }
            return ((_a = resolvedDetails.details) === null || _a === void 0 ? void 0 : _a.getEndpointById(didUri)) || null;
        }
        default:
            throw utils_1.SDKErrors.ERROR_UNSUPPORTED_DID(didUri);
    }
}
exports.resolveServiceEndpoint = resolveServiceEndpoint;
/**
 * Resolve a DID URI (including a key ID or a service ID).
 *
 * @param didUri The DID URI to resolve.
 * @returns The DID, key details or service details depending on the input URI. If not resource can be resolved, null is returned.
 */
async function resolve(didUri) {
    const { fragment } = Did_utils_1.parseDidUrl(didUri);
    if (fragment) {
        return resolveKey(didUri) || resolveServiceEndpoint(didUri) || null;
    }
    return resolveDoc(didUri);
}
exports.resolve = resolve;
exports.DefaultResolver = {
    resolveDoc,
    resolveKey,
    resolve,
    resolveServiceEndpoint,
};
