/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
/// <reference types="bn.js" />
import type { Extrinsic } from '@polkadot/types/interfaces';
import type { IDidKeyDetails, KeystoreSigner, SubmittableExtrinsic, ApiOrMetadata, CallMeta, IIdentity } from '@kiltprotocol/types';
import { BN } from '@polkadot/util';
import { DidDetails } from './DidDetails';
import type { FullDidDetailsCreationOpts } from '../types';
export declare class FullDidDetails extends DidDetails {
    static readonly FULL_DID_LATEST_VERSION = 1;
    private lastTxIndex;
    constructor({ did, keys, keyRelationships, lastTxIndex, serviceEndpoints, }: FullDidDetailsCreationOpts);
    /**
     * Gets the next nonce/transaction index required for DID authorized blockchain transactions.
     *
     * @param increment Flag indicating whether the retrieved tx index should be increased.
     * @returns A [[BN]] indicating the next transaction index.
     */
    getNextTxIndex(increment?: boolean): BN;
    /**
     * Returns all the DID keys that could be used to authorize the submission of the provided call.
     *
     * @param call The call to submit.
     * @returns The set of keys that could be used to sign the call.
     */
    getKeysForCall(call: CallMeta): IDidKeyDetails[];
    /**
     * Returns all the DID keys that could be used to authorize the submission of the provided extrinsic.
     *
     * @param apiOrMetadata The node runtime information to use to retrieve the required information.
     * @param extrinsic The extrinsic to submit.
     * @returns The set of keys that could be used to sign the extrinsic.
     */
    getKeysForExtrinsic(apiOrMetadata: ApiOrMetadata, extrinsic: Extrinsic): IDidKeyDetails[];
    /**
     * Signs and returns the provided unsigned extrinsic with the right DID key, if present. Otherwise, it will return an error.
     *
     * @param extrinsic The unsigned extrinsic to sign.
     * @param signer The keystore to be used to sign the encoded extrinsic.
     * @param submitterAccount The KILT account to bind the DID operation to (to avoid MitM and replay attacks).
     * @param incrementTxIndex Flag indicating whether the DID nonce should be increased before submitting the operation or not.
     * @returns The DID-signed submittable extrinsic.
     */
    authorizeExtrinsic(extrinsic: Extrinsic, signer: KeystoreSigner, submitterAccount: IIdentity['address'], incrementTxIndex?: boolean): Promise<SubmittableExtrinsic>;
    /**
     * Retrieve from the chain the last used nonce for the DID.
     *
     * @returns The last used nonce.
     */
    refreshTxIndex(): Promise<this>;
}
