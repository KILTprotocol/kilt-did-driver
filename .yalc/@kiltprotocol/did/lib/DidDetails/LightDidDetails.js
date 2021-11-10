"use strict";
/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightDidDetails = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const utils_1 = require("@kiltprotocol/utils");
const util_crypto_1 = require("@polkadot/util-crypto");
const Did_utils_1 = require("../Did.utils");
const DidDetails_1 = require("./DidDetails");
const LightDidDetails_utils_1 = require("./LightDidDetails.utils");
class LightDidDetails extends DidDetails_1.DidDetails {
    constructor({ authenticationKey, encryptionKey = undefined, serviceEndpoints = [], }) {
        LightDidDetails_utils_1.checkLightDidCreationOptions({
            authenticationKey,
            encryptionKey,
            serviceEndpoints,
        });
        const encodedDetails = LightDidDetails_utils_1.serializeAndEncodeAdditionalLightDidDetails({
            encryptionKey,
            serviceEndpoints,
        });
        const authenticationKeyTypeEncoding = Did_utils_1.getEncodingForSigningKeyType(authenticationKey.type);
        // A KILT light DID identifier becomes <key_type_encoding><kilt_address>
        const id = authenticationKeyTypeEncoding.concat(util_crypto_1.encodeAddress(authenticationKey.publicKey, 38));
        let did = Did_utils_1.getKiltDidFromIdentifier(id, 'light', LightDidDetails.LIGHT_DID_LATEST_VERSION);
        if (encodedDetails) {
            did = did.concat(':', encodedDetails);
        }
        super(did, id, serviceEndpoints.map((service) => {
            return Object.assign(Object.assign({}, service), { id: Did_utils_1.assembleDidFragment(did, service.id) });
        }));
        // Authentication key always has the #authentication ID.
        this.keys = new Map([
            [
                `${this.did}#authentication`,
                {
                    controller: this.did,
                    id: `${this.did}#authentication`,
                    publicKeyHex: utils_1.Crypto.u8aToHex(authenticationKey.publicKey),
                    type: authenticationKey.type,
                },
            ],
        ]);
        this.keyRelationships = {
            authentication: [`${this.didUri}#authentication`],
        };
        // Encryption key always has the #encryption ID.
        if (encryptionKey) {
            this.keys.set(`${this.didUri}#encryption`, {
                controller: this.did,
                id: `${this.did}#encryption`,
                publicKeyHex: utils_1.Crypto.u8aToHex(encryptionKey.publicKey),
                type: encryptionKey.type,
            });
            this.keyRelationships.keyAgreement = [`${this.didUri}#encryption`];
        }
    }
}
exports.LightDidDetails = LightDidDetails;
/// The latest version for KILT light DIDs.
LightDidDetails.LIGHT_DID_LATEST_VERSION = 1;
