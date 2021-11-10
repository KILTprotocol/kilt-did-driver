"use strict";
/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.newFullDidDetailsfromKeys = exports.getKeyIdsForExtrinsic = exports.getKeyIdsForCall = exports.getKeysForExtrinsic = exports.getKeysForCall = exports.mapExtrinsicToKeyRelationship = exports.extrinsicToCallMeta = exports.mapCallToKeyRelationship = void 0;
const types_1 = require("@polkadot/types");
const util_1 = require("@polkadot/util");
const types_2 = require("@kiltprotocol/types");
const FullDidDetails_1 = require("./FullDidDetails");
// Call::Attestation(_) => Some(did::DidVerificationKeyRelationship::AssertionMethod),
// Call::Ctype(_) => Some(did::DidVerificationKeyRelationship::AssertionMethod),
// Call::Delegation(_) => Some(did::DidVerificationKeyRelationship::CapabilityDelegation),
const mapping = {
    attestation: { default: types_2.KeyRelationship.assertionMethod },
    ctype: { default: types_2.KeyRelationship.assertionMethod },
    delegation: { default: types_2.KeyRelationship.capabilityDelegation },
    did: {
        default: types_2.KeyRelationship.authentication,
        create: 'paymentAccount',
        submitDidCall: 'paymentAccount',
        reclaimDeposit: 'paymentAccount',
    },
    default: { default: 'paymentAccount' },
};
// internally maps call.section & call.method to a key relationship - or indicates a payment account (substrate key holding tokens) must be used
function mapCallToKeyRelationship(call) {
    const { section, method } = call;
    const methodData = mapping[section] || mapping.default;
    return methodData[method] || methodData.default;
}
exports.mapCallToKeyRelationship = mapCallToKeyRelationship;
function isApiPromise(api) {
    return api.type === 'promise';
}
function extrinsicToCallMeta(apiOrMetadata, extrinsic) {
    if (isApiPromise(apiOrMetadata)) {
        return apiOrMetadata.findCall(extrinsic.callIndex);
    }
    const registry = new types_1.TypeRegistry();
    registry.setMetadata(apiOrMetadata);
    return registry.findMetaCall(extrinsic.callIndex);
}
exports.extrinsicToCallMeta = extrinsicToCallMeta;
// to recover Call info from an Extrinsic/SubmittableExtrinsic, we need the chain's metadata, which we can also get from the api object
function mapExtrinsicToKeyRelationship(apiOrMetadata, extrinsic) {
    const callMeta = extrinsicToCallMeta(apiOrMetadata, extrinsic);
    return mapCallToKeyRelationship(callMeta);
}
exports.mapExtrinsicToKeyRelationship = mapExtrinsicToKeyRelationship;
// the above can be used to query key info from the did info object
function getKeysForCall(didDetails, call) {
    const keyRelationship = mapCallToKeyRelationship(call);
    if (keyRelationship === 'paymentAccount')
        return [];
    return didDetails.getKeys(keyRelationship);
}
exports.getKeysForCall = getKeysForCall;
function getKeysForExtrinsic(apiOrMetadata, didDetails, extrinsic) {
    const callMeta = extrinsicToCallMeta(apiOrMetadata, extrinsic);
    return getKeysForCall(didDetails, callMeta);
}
exports.getKeysForExtrinsic = getKeysForExtrinsic;
function getKeyIdsForCall(didDetails, call) {
    return getKeysForCall(didDetails, call).map((key) => key.id);
}
exports.getKeyIdsForCall = getKeyIdsForCall;
function getKeyIdsForExtrinsic(apiOrMetadata, didDetails, extrinsic) {
    const callMeta = extrinsicToCallMeta(apiOrMetadata, extrinsic);
    return getKeyIdsForCall(didDetails, callMeta);
}
exports.getKeyIdsForExtrinsic = getKeyIdsForExtrinsic;
function newFullDidDetailsfromKeys(keys) {
    const did = keys[types_2.KeyRelationship.authentication].controller;
    const allKeys = [];
    const keyRelationships = {};
    Object.entries(keys).forEach(([thisRole, thisKey]) => {
        if (thisKey) {
            keyRelationships[thisRole] = [thisKey.id];
            allKeys.push(thisKey);
        }
    });
    return new FullDidDetails_1.FullDidDetails({
        did,
        keys: allKeys,
        keyRelationships,
        lastTxIndex: new util_1.BN(0),
    });
}
exports.newFullDidDetailsfromKeys = newFullDidDetailsfromKeys;
