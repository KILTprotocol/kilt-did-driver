"use strict";
/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deriveDidPublicKey = exports.writeNewDidFromDidDetails = void 0;
const types_1 = require("@kiltprotocol/types");
const utils_1 = require("@kiltprotocol/utils");
const Did_chain_1 = require("../Did.chain");
const Did_utils_1 = require("../Did.utils");
/**
 * Write on the KILT blockchain a new (full) DID with the provided details.
 *
 * @param didDetails The details of the new DID to write on chain.
 * @param submitter The account that is authorised to submit the creation operation to the blockchain.
 * @param signer The signer (a KILT account) to be used to sign the resulting operation.
 * @returns The signed extrinsic that can be submitted to the KILT blockchain to create the new DID.
 */
async function writeNewDidFromDidDetails(didDetails, submitter, signer) {
    const [signingKey] = didDetails.getKeys(types_1.KeyRelationship.authentication);
    const [assertionMethod] = didDetails.getKeys(types_1.KeyRelationship.assertionMethod);
    const [delegation] = didDetails.getKeys(types_1.KeyRelationship.capabilityDelegation);
    const [keyAgreement] = didDetails.getKeys(types_1.KeyRelationship.keyAgreement);
    const keys = {
        [types_1.KeyRelationship.assertionMethod]: Object.assign(Object.assign({}, assertionMethod), { publicKey: utils_1.Crypto.coToUInt8(assertionMethod.publicKeyHex) }),
        [types_1.KeyRelationship.capabilityDelegation]: Object.assign(Object.assign({}, delegation), { publicKey: utils_1.Crypto.coToUInt8(delegation.publicKeyHex) }),
        [types_1.KeyRelationship.keyAgreement]: Object.assign(Object.assign({}, keyAgreement), { publicKey: utils_1.Crypto.coToUInt8(keyAgreement.publicKeyHex) }),
    };
    return Did_chain_1.generateCreateTx({
        signer,
        signingPublicKey: signingKey.publicKeyHex,
        alg: Did_utils_1.getSignatureAlgForKeyType(signingKey.type),
        didIdentifier: Did_utils_1.getIdentifierFromKiltDid(didDetails.did),
        submitter,
        keys,
        endpoints: didDetails.getEndpoints(),
    });
}
exports.writeNewDidFromDidDetails = writeNewDidFromDidDetails;
/**
 * A tool to predict public key details if a given key would be added to an on-chain DID.
 * Especially handy for predicting the key id or for deriving which DID may be claimed with a
 * given authentication key.
 *
 * @param typeRegistry A TypeRegistry instance to which @kiltprotocol/types have been registered.
 * @param publicKey The public key in hex or U8a encoding.
 * @param type The [[CHAIN_SUPPORTED_KEY_TYPES]] variant indicating the key type.
 * @param controller Optionally, set the the DID to which this key would be added.
 * If left blank, the controller DID is inferred from the public key, mimicing the link between a new
 * DID and its authentication key.
 * @returns The [[IDidKeyDetails]] including key id, controller, type, and the public key hex encoded.
 */
function deriveDidPublicKey(typeRegistry, publicKey, type, controller) {
    const publicKeyHex = typeof publicKey === 'string' ? publicKey : utils_1.Crypto.u8aToHex(publicKey);
    const publicKeyU8a = publicKey instanceof Uint8Array ? publicKey : utils_1.Crypto.coToUInt8(publicKey);
    const keyIdentifier = Did_utils_1.computeKeyId(Did_utils_1.encodeDidPublicKey(typeRegistry, { publicKey: publicKeyU8a, type }));
    const did = controller ||
        Did_utils_1.getKiltDidFromIdentifier(utils_1.Crypto.encodeAddress(publicKeyU8a, 38), 'full');
    return {
        id: Did_utils_1.assembleDidFragment(did, keyIdentifier),
        controller: did,
        type,
        publicKeyHex,
    };
}
exports.deriveDidPublicKey = deriveDidPublicKey;
