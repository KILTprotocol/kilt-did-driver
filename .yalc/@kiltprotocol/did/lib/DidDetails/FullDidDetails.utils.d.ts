/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
import type { Extrinsic } from '@polkadot/types/interfaces';
import type { ApiOrMetadata, CallMeta, IDidDetails, IDidKeyDetails, VerificationKeyRelationship } from '@kiltprotocol/types';
import { KeyRelationship } from '@kiltprotocol/types';
import { FullDidDetails } from './FullDidDetails';
export declare function mapCallToKeyRelationship(call: CallMeta): VerificationKeyRelationship | 'paymentAccount';
export declare function extrinsicToCallMeta(apiOrMetadata: ApiOrMetadata, extrinsic: Extrinsic): CallMeta;
export declare function mapExtrinsicToKeyRelationship(apiOrMetadata: ApiOrMetadata, extrinsic: Extrinsic): VerificationKeyRelationship | 'paymentAccount';
export declare function getKeysForCall(didDetails: IDidDetails, call: CallMeta): IDidKeyDetails[];
export declare function getKeysForExtrinsic(apiOrMetadata: ApiOrMetadata, didDetails: IDidDetails, extrinsic: Extrinsic): IDidKeyDetails[];
export declare function getKeyIdsForCall(didDetails: IDidDetails, call: CallMeta): Array<IDidKeyDetails['id']>;
export declare function getKeyIdsForExtrinsic(apiOrMetadata: ApiOrMetadata, didDetails: IDidDetails, extrinsic: Extrinsic): Array<IDidKeyDetails['id']>;
export declare function newFullDidDetailsfromKeys(keys: Partial<Record<KeyRelationship, IDidKeyDetails>> & {
    [KeyRelationship.authentication]: IDidKeyDetails;
}): FullDidDetails;
