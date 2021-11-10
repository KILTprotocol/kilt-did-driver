"use strict";
/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullDidDetails = void 0;
const chain_helpers_1 = require("@kiltprotocol/chain-helpers");
const types_1 = require("@kiltprotocol/types");
const Did_chain_1 = require("../Did.chain");
const FullDidDetails_utils_1 = require("./FullDidDetails.utils");
const Did_utils_1 = require("../Did.utils");
const DidDetails_1 = require("./DidDetails");
function errorCheck({ did, keys, keyRelationships, }) {
    var _a;
    if (!did) {
        throw Error('did is required for FullDidDetails');
    }
    const { type } = Did_utils_1.parseDidUrl(did);
    if (type !== 'full') {
        throw Error('Only a full DID URI is allowed.');
    }
    const keyIds = new Set(keys.map((key) => key.id));
    if (((_a = keyRelationships[types_1.KeyRelationship.authentication]) === null || _a === void 0 ? void 0 : _a.length) !== 1) {
        throw Error(`One and only one ${types_1.KeyRelationship.authentication} key is required on FullDidDetails`);
    }
    const allowedKeyRelationships = [
        ...Object.values(types_1.KeyRelationship),
        'none',
    ];
    Object.keys(keyRelationships).forEach((kr) => {
        if (!allowedKeyRelationships.includes(kr)) {
            throw Error(`key relationship ${kr} is not recognized. Allowed: ${types_1.KeyRelationship}`);
        }
    });
    const keyReferences = new Set(Array.prototype.concat(...Object.values(keyRelationships)));
    keyReferences.forEach((id) => {
        if (!keyIds.has(id))
            throw new Error(`No key with id ${id} in "keys"`);
    });
}
class FullDidDetails extends DidDetails_1.DidDetails {
    constructor({ did, keys, keyRelationships = {}, lastTxIndex, serviceEndpoints = [], }) {
        errorCheck({
            did,
            keys,
            keyRelationships,
            lastTxIndex,
            serviceEndpoints,
        });
        const id = Did_utils_1.getIdentifierFromKiltDid(did);
        super(did, id, serviceEndpoints);
        this.keys = new Map(keys.map((key) => [key.id, key]));
        this.lastTxIndex = lastTxIndex;
        this.keyRelationships = keyRelationships;
        this.keyRelationships.none = [];
        const keysWithRelationship = new Set(Array.prototype.concat(...Object.values(keyRelationships)));
        this.keys.forEach((_, keyId) => {
            var _a;
            if (!keysWithRelationship.has(keyId)) {
                (_a = this.keyRelationships.none) === null || _a === void 0 ? void 0 : _a.push(keyId);
            }
        });
    }
    /**
     * Gets the next nonce/transaction index required for DID authorized blockchain transactions.
     *
     * @param increment Flag indicating whether the retrieved tx index should be increased.
     * @returns A [[BN]] indicating the next transaction index.
     */
    getNextTxIndex(increment = true) {
        const nextIndex = this.lastTxIndex.addn(1);
        if (increment)
            this.lastTxIndex = nextIndex;
        return nextIndex;
    }
    /**
     * Returns all the DID keys that could be used to authorize the submission of the provided call.
     *
     * @param call The call to submit.
     * @returns The set of keys that could be used to sign the call.
     */
    getKeysForCall(call) {
        return FullDidDetails_utils_1.getKeysForCall(this, call);
    }
    /**
     * Returns all the DID keys that could be used to authorize the submission of the provided extrinsic.
     *
     * @param apiOrMetadata The node runtime information to use to retrieve the required information.
     * @param extrinsic The extrinsic to submit.
     * @returns The set of keys that could be used to sign the extrinsic.
     */
    getKeysForExtrinsic(apiOrMetadata, extrinsic) {
        return FullDidDetails_utils_1.getKeysForExtrinsic(apiOrMetadata, this, extrinsic);
    }
    /**
     * Signs and returns the provided unsigned extrinsic with the right DID key, if present. Otherwise, it will return an error.
     *
     * @param extrinsic The unsigned extrinsic to sign.
     * @param signer The keystore to be used to sign the encoded extrinsic.
     * @param submitterAccount The KILT account to bind the DID operation to (to avoid MitM and replay attacks).
     * @param incrementTxIndex Flag indicating whether the DID nonce should be increased before submitting the operation or not.
     * @returns The DID-signed submittable extrinsic.
     */
    async authorizeExtrinsic(extrinsic, signer, submitterAccount, incrementTxIndex = true) {
        const { api } = await chain_helpers_1.BlockchainApiConnection.getConnectionOrConnect();
        const [signingKey] = this.getKeysForExtrinsic(api, extrinsic);
        if (!signingKey) {
            throw new Error(`The details for did ${this.did} do not contain the required keys for this operation`);
        }
        return Did_chain_1.generateDidAuthenticatedTx({
            didIdentifier: this.identifier,
            signingPublicKey: signingKey.publicKeyHex,
            alg: Did_utils_1.getSignatureAlgForKeyType(signingKey.type),
            signer,
            call: extrinsic,
            txCounter: this.getNextTxIndex(incrementTxIndex),
            submitter: submitterAccount,
        });
    }
    /**
     * Retrieve from the chain the last used nonce for the DID.
     *
     * @returns The last used nonce.
     */
    async refreshTxIndex() {
        this.lastTxIndex = await Did_chain_1.queryLastTxCounter(this.did);
        return this;
    }
}
exports.FullDidDetails = FullDidDetails;
/// The latest version for KILT full DIDs.
FullDidDetails.FULL_DID_LATEST_VERSION = 1;
