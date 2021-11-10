"use strict";
/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDidAuthenticatedTx = exports.getReclaimDepositExtrinsic = exports.getDeleteDidExtrinsic = exports.getRemoveEndpointExtrinsic = exports.getAddEndpointExtrinsic = exports.getAddKeyExtrinsic = exports.getRemoveKeyExtrinsic = exports.getSetKeyExtrinsic = exports.generateCreateTx = exports.queryDidDeletionStatus = exports.queryDeletedDids = exports.queryDepositAmount = exports.queryLastTxCounter = exports.queryEndpointsCounts = exports.queryServiceEndpoint = exports.queryServiceEndpoints = exports.queryDidKey = exports.queryDidDetails = exports.queryById = exports.queryEndpointsCountsEncoded = exports.queryAllServicesEncoded = exports.queryServiceEncoded = exports.queryDeletedDidsEncoded = exports.queryDidEncoded = void 0;
const types_1 = require("@kiltprotocol/types");
const chain_helpers_1 = require("@kiltprotocol/chain-helpers");
const utils_1 = require("@kiltprotocol/utils");
const util_1 = require("@polkadot/util");
const Did_utils_1 = require("./Did.utils");
// ### RAW QUERYING (lowest layer)
// Query a full DID given the identifier (a KILT address for v1).
// Interacts with the Did storage map.
async function queryDidEncoded(didIdentifier) {
    const { api } = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    return api.query.did.did(didIdentifier);
}
exports.queryDidEncoded = queryDidEncoded;
// Query ALL deleted DIDs, which can be very time consuming if the number of deleted DIDs gets large.
async function queryDeletedDidsEncoded() {
    const { api } = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    // Query all the storage keys, and then only take the relevant property, i.e., the encoded DID identifier.
    return api.query.did.didBlacklist
        .keys()
        .then((entries) => entries.map(({ args: [encodedDidIdentifier] }) => encodedDidIdentifier));
}
exports.queryDeletedDidsEncoded = queryDeletedDidsEncoded;
// Returns the raw representation of the storage entry for the given DID identifier.
async function queryDidDeletionStatusEncoded(didIdentifier) {
    const { api } = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    const encodedStorageKey = await api.query.did.didBlacklist.key(didIdentifier);
    return (api.rpc.state
        .queryStorageAt([encodedStorageKey])
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .then((encodedValue) => encodedValue.pop().toU8a()));
}
// Query a DID service given the DID identifier and the service ID.
// Interacts with the ServiceEndpoints storage double map.
async function queryServiceEncoded(didIdentifier, serviceId) {
    const { api } = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    return api.query.did.serviceEndpoints(didIdentifier, serviceId);
}
exports.queryServiceEncoded = queryServiceEncoded;
// Query all services for a DID given the DID identifier.
// Interacts with the ServiceEndpoints storage double map.
async function queryAllServicesEncoded(didIdentifier) {
    const { api } = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    const encodedEndpoints = await api.query.did.serviceEndpoints.entries(didIdentifier);
    return encodedEndpoints.map(([, encodedValue]) => encodedValue.unwrap());
}
exports.queryAllServicesEncoded = queryAllServicesEncoded;
// Query the # of services stored under a DID without fetching all the services.
// Interacts with the DidEndpointsCount storage map.
async function queryEndpointsCountsEncoded(didIdentifier) {
    const { api } = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    return api.query.did.didEndpointsCount(didIdentifier);
}
exports.queryEndpointsCountsEncoded = queryEndpointsCountsEncoded;
async function queryDepositAmountEncoded() {
    const { api } = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    return api.consts.did.deposit;
}
// ### DECODED QUERYING (builds on top of raw querying)
// This should not be part of this layer, as it has knowledge of DID URI.
// This level should only be concerned with IDs.
// Building DID URIs from IDs should be a concern of a higher level, so
// we might want to refactor this in the future when time pressure is off.
function assembleKeyId(keyId, did) {
    return `${did}#${keyId.toHex()}`;
}
function decodeDidPublicKeyDetails(did, keyId, keyDetails) {
    const key = keyDetails.key.value;
    return {
        id: assembleKeyId(keyId, did),
        type: key.type.toLowerCase(),
        controller: did,
        publicKeyHex: key.value.toHex(),
        includedAt: keyDetails.blockNumber.toNumber(),
    };
}
// Same reasoning as `assembleKeyId`.
function decodeDidChainRecord(didDetail, did) {
    const publicKeys = Array.from(didDetail.publicKeys.entries()).map(([keyId, keyDetails]) => {
        return decodeDidPublicKeyDetails(did, keyId, keyDetails);
    });
    const authenticationKeyId = assembleKeyId(didDetail.authenticationKey, did);
    const keyAgreementKeyIds = Array.from(didDetail.keyAgreementKeys.values()).map((id) => assembleKeyId(id, did));
    const didRecord = {
        did,
        publicKeys,
        authenticationKey: authenticationKeyId,
        keyAgreementKeys: keyAgreementKeyIds,
        lastTxCounter: didDetail.lastTxCounter,
    };
    if (didDetail.delegationKey.isSome) {
        didRecord.capabilityDelegationKey = assembleKeyId(didDetail.delegationKey.unwrap(), did);
    }
    if (didDetail.attestationKey.isSome) {
        didRecord.assertionMethodKey = assembleKeyId(didDetail.attestationKey.unwrap(), did);
    }
    return didRecord;
}
// Same reasoning as `assembleKeyId`.
function decodeServiceChainRecord(serviceDetails, did) {
    const decodedId = util_1.hexToString(serviceDetails.id.toString());
    return {
        id: Did_utils_1.assembleDidFragment(did, decodedId),
        types: serviceDetails.serviceTypes.map((type) => util_1.hexToString(type.toString())),
        urls: serviceDetails.urls.map((url) => util_1.hexToString(url.toString())),
    };
}
async function queryById(didIdentifier) {
    const result = await queryDidEncoded(didIdentifier);
    if (result.isNone) {
        return null;
    }
    return decodeDidChainRecord(result.unwrap(), Did_utils_1.getKiltDidFromIdentifier(didIdentifier, 'full'));
}
exports.queryById = queryById;
// Query full DID details given the DID URI.
async function queryDidDetails(didUri) {
    const { identifier, fragment } = Did_utils_1.parseDidUrl(didUri);
    if (fragment) {
        throw new Error(`The provided URI ${didUri} must not contain any fragment.`);
    }
    return queryById(identifier);
}
exports.queryDidDetails = queryDidDetails;
// Query a given key given the DID identifier and the key ID.
async function queryDidKey(keyUri) {
    const { identifier, fragment } = Did_utils_1.parseDidUrl(keyUri);
    if (!fragment) {
        throw new Error(`The provided URI ${keyUri} does not contain a valid fragment for key ID.`);
    }
    const didDetails = await queryById(identifier);
    if (!didDetails) {
        return null;
    }
    return didDetails.publicKeys.find((key) => key.id === keyUri) || null;
}
exports.queryDidKey = queryDidKey;
async function queryServiceEndpoints(didUri) {
    const { identifier, fragment } = Did_utils_1.parseDidUrl(didUri);
    if (fragment) {
        throw new Error(`The provided URI ${didUri} must not contain any fragment.`);
    }
    const encoded = await queryAllServicesEncoded(identifier);
    return encoded.map((e) => decodeServiceChainRecord(e, didUri));
}
exports.queryServiceEndpoints = queryServiceEndpoints;
async function queryServiceEndpoint(serviceUri) {
    const { identifier, fragment } = Did_utils_1.parseDidUrl(serviceUri);
    if (!fragment) {
        throw new Error(`The provided URI ${serviceUri} does not contain a valid fragment for service ID.`);
    }
    const serviceEncoded = await queryServiceEncoded(identifier, fragment);
    if (serviceEncoded.isNone)
        return null;
    const didUri = Did_utils_1.getKiltDidFromIdentifier(identifier, 'full');
    return decodeServiceChainRecord(serviceEncoded.unwrap(), didUri);
}
exports.queryServiceEndpoint = queryServiceEndpoint;
async function queryEndpointsCounts(didUri) {
    const { identifier, fragment } = Did_utils_1.parseDidUrl(didUri);
    if (fragment) {
        throw new Error(`The provided URI ${didUri} must not contain any fragment.`);
    }
    const blockchain = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    const count = await blockchain.api.query.did.didEndpointsCount(identifier);
    return count.toNumber();
}
exports.queryEndpointsCounts = queryEndpointsCounts;
async function queryLastTxCounter(didUri) {
    const { identifier, fragment } = Did_utils_1.parseDidUrl(didUri);
    if (fragment) {
        throw new Error(`The provided URI ${didUri} must not contain any fragment.`);
    }
    const encoded = await queryDidEncoded(identifier);
    return encoded.isSome ? encoded.unwrap().lastTxCounter.toBn() : new util_1.BN(0);
}
exports.queryLastTxCounter = queryLastTxCounter;
async function queryDepositAmount() {
    const encodedDeposit = await queryDepositAmountEncoded();
    return encodedDeposit.toBn();
}
exports.queryDepositAmount = queryDepositAmount;
async function queryDeletedDids() {
    const encodedIdentifiers = await queryDeletedDidsEncoded();
    return encodedIdentifiers.map((id) => Did_utils_1.getKiltDidFromIdentifier(id.toHuman(), 'full'));
}
exports.queryDeletedDids = queryDeletedDids;
async function queryDidDeletionStatus(didUri) {
    const { identifier } = Did_utils_1.parseDidUrl(didUri);
    const encodedDeletionStorageEntry = await queryDidDeletionStatusEncoded(identifier);
    // The result is a 1-byte array where the only element is 1 if the DID has been deleted, and 0 otherwise.
    return encodedDeletionStorageEntry[0] === 1;
}
exports.queryDidDeletionStatus = queryDidDeletionStatus;
// ### EXTRINSICS
async function generateCreateTx({ signer, signingPublicKey, alg, didIdentifier, submitter, keys = {}, endpoints = [], }) {
    const { api } = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    const encoded = Did_utils_1.encodeDidCreationOperation(api.registry, {
        didIdentifier,
        submitter,
        keys,
        endpoints,
    });
    const signature = await signer.sign({
        data: encoded.toU8a(),
        meta: {},
        publicKey: utils_1.Crypto.coToUInt8(signingPublicKey),
        alg,
    });
    return api.tx.did.create(encoded, {
        [signature.alg]: signature.data,
    });
}
exports.generateCreateTx = generateCreateTx;
async function getSetKeyExtrinsic(keyRelationship, key) {
    const keyAsEnum = Did_utils_1.formatPublicKey(key);
    const { api } = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    switch (keyRelationship) {
        case types_1.KeyRelationship.authentication:
            return api.tx.did.setAuthenticationKey(keyAsEnum);
        case types_1.KeyRelationship.capabilityDelegation:
            return api.tx.did.setDelegationKey(keyAsEnum);
        case types_1.KeyRelationship.assertionMethod:
            return api.tx.did.setAttestationKey(keyAsEnum);
        default:
            throw new Error(`setting a key is only allowed for the following key types: ${[
                types_1.KeyRelationship.authentication,
                types_1.KeyRelationship.capabilityDelegation,
                types_1.KeyRelationship.assertionMethod,
            ]}`);
    }
}
exports.getSetKeyExtrinsic = getSetKeyExtrinsic;
async function getRemoveKeyExtrinsic(keyRelationship, keyId) {
    const { api } = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    switch (keyRelationship) {
        case types_1.KeyRelationship.capabilityDelegation:
            return api.tx.did.removeDelegationKey();
        case types_1.KeyRelationship.assertionMethod:
            return api.tx.did.removeAttestationKey();
        case types_1.KeyRelationship.keyAgreement:
            if (!keyId) {
                throw new Error(`When removing a ${types_1.KeyRelationship.keyAgreement} key it is required to specify the id of the key to be removed.`);
            }
            return api.tx.did.removeKeyAgreementKey(keyId);
        default:
            throw new Error(`key removal is only allowed for the following key types: ${[
                types_1.KeyRelationship.keyAgreement,
                types_1.KeyRelationship.capabilityDelegation,
                types_1.KeyRelationship.assertionMethod,
            ]}`);
    }
}
exports.getRemoveKeyExtrinsic = getRemoveKeyExtrinsic;
async function getAddKeyExtrinsic(keyRelationship, key) {
    const keyAsEnum = Did_utils_1.formatPublicKey(key);
    const { api } = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    if (keyRelationship === types_1.KeyRelationship.keyAgreement) {
        return api.tx.did.addKeyAgreementKey(keyAsEnum);
    }
    throw new Error(`adding to the key set is only allowed for the following key types:  ${[
        types_1.KeyRelationship.keyAgreement,
    ]}`);
}
exports.getAddKeyExtrinsic = getAddKeyExtrinsic;
async function getAddEndpointExtrinsic(endpoint) {
    const { api } = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    const encoded = Did_utils_1.encodeServiceEndpoint(api.registry, endpoint);
    return api.tx.did.addServiceEndpoint(encoded);
}
exports.getAddEndpointExtrinsic = getAddEndpointExtrinsic;
async function getRemoveEndpointExtrinsic(endpointId) {
    const { api } = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    return api.tx.did.removeServiceEndpoint(endpointId);
}
exports.getRemoveEndpointExtrinsic = getRemoveEndpointExtrinsic;
async function getDeleteDidExtrinsic(endpointsCount) {
    const { api } = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    return api.tx.did.delete(endpointsCount);
}
exports.getDeleteDidExtrinsic = getDeleteDidExtrinsic;
async function getReclaimDepositExtrinsic(didIdentifier, endpointsCount) {
    const { api } = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    return api.tx.did.reclaimDeposit(didIdentifier, endpointsCount);
}
exports.getReclaimDepositExtrinsic = getReclaimDepositExtrinsic;
// The block number can either be provided by the DID subject,
// or the latest one will automatically be fetched from the blockchain.
async function generateDidAuthenticatedTx({ signingPublicKey, alg, signer, txCounter, didIdentifier, call, submitter, blockNumber, }) {
    const blockchain = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
    const block = blockNumber || (await blockchain.api.query.system.number());
    const signableCall = Did_utils_1.encodeDidAuthorizedCallOperation(blockchain.api.registry, { txCounter, didIdentifier, call, submitter, blockNumber: block });
    const signature = await signer.sign({
        data: signableCall.toU8a(),
        meta: {
            method: call.method.toHex(),
            version: call.version,
            specVersion: blockchain.api.runtimeVersion.specVersion.toString(),
            transactionVersion: blockchain.api.runtimeVersion.transactionVersion.toString(),
            genesisHash: blockchain.api.genesisHash.toHex(),
            nonce: signableCall.txCounter.toHex(),
            address: utils_1.Crypto.encodeAddress(signableCall.did),
        },
        publicKey: utils_1.Crypto.coToUInt8(signingPublicKey),
        alg,
    });
    return blockchain.api.tx.did.submitDidCall(signableCall, {
        [signature.alg]: signature.data,
    });
}
exports.generateDidAuthenticatedTx = generateDidAuthenticatedTx;
