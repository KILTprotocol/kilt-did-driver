/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
/// <reference types="bn.js" />
/**
 * @packageDocumentation
 * @module DID
 */
import type { Option, u32, GenericAccountId } from '@polkadot/types';
import type { IIdentity, SubmittableExtrinsic, IDidKeyDetails, IDidServiceEndpoint, KeystoreSigningOptions, IDidDetails } from '@kiltprotocol/types';
import { KeyRelationship } from '@kiltprotocol/types';
import type { Extrinsic } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';
import type { AuthenticationTxCreationInput, IDidCreationOptions, IDidChainRecordJSON, INewPublicKey, IDidChainRecordCodec, IServiceEndpointChainRecordCodec } from './types';
export declare function queryDidEncoded(didIdentifier: IIdentity['address']): Promise<Option<IDidChainRecordCodec>>;
export declare function queryDeletedDidsEncoded(): Promise<GenericAccountId[]>;
export declare function queryServiceEncoded(didIdentifier: IIdentity['address'], serviceId: IDidServiceEndpoint['id']): Promise<Option<IServiceEndpointChainRecordCodec>>;
export declare function queryAllServicesEncoded(didIdentifier: IIdentity['address']): Promise<IServiceEndpointChainRecordCodec[]>;
export declare function queryEndpointsCountsEncoded(didIdentifier: IIdentity['address']): Promise<u32>;
export declare function queryById(didIdentifier: IIdentity['address']): Promise<IDidChainRecordJSON | null>;
export declare function queryDidDetails(didUri: IDidDetails['did']): Promise<IDidChainRecordJSON | null>;
export declare function queryDidKey(keyUri: IDidKeyDetails['id']): Promise<IDidKeyDetails | null>;
export declare function queryServiceEndpoints(didUri: IDidDetails['did']): Promise<IDidServiceEndpoint[]>;
export declare function queryServiceEndpoint(serviceUri: IDidServiceEndpoint['id']): Promise<IDidServiceEndpoint | null>;
export declare function queryEndpointsCounts(didUri: IDidDetails['did']): Promise<number>;
export declare function queryLastTxCounter(didUri: IDidDetails['did']): Promise<BN>;
export declare function queryDepositAmount(): Promise<BN>;
export declare function queryDeletedDids(): Promise<Array<IDidDetails['did']>>;
export declare function queryDidDeletionStatus(didUri: IDidDetails['did']): Promise<boolean>;
export declare function generateCreateTx({ signer, signingPublicKey, alg, didIdentifier, submitter, keys, endpoints, }: IDidCreationOptions & KeystoreSigningOptions): Promise<SubmittableExtrinsic>;
export declare function getSetKeyExtrinsic(keyRelationship: KeyRelationship, key: INewPublicKey): Promise<Extrinsic>;
export declare function getRemoveKeyExtrinsic(keyRelationship: KeyRelationship, keyId?: string): Promise<Extrinsic>;
export declare function getAddKeyExtrinsic(keyRelationship: KeyRelationship, key: INewPublicKey): Promise<Extrinsic>;
export declare function getAddEndpointExtrinsic(endpoint: IDidServiceEndpoint): Promise<Extrinsic>;
export declare function getRemoveEndpointExtrinsic(endpointId: IDidServiceEndpoint['id']): Promise<Extrinsic>;
export declare function getDeleteDidExtrinsic(endpointsCount: number): Promise<Extrinsic>;
export declare function getReclaimDepositExtrinsic(didIdentifier: IIdentity['address'], endpointsCount: number): Promise<SubmittableExtrinsic>;
export declare function generateDidAuthenticatedTx({ signingPublicKey, alg, signer, txCounter, didIdentifier, call, submitter, blockNumber, }: AuthenticationTxCreationInput & KeystoreSigningOptions): Promise<SubmittableExtrinsic>;
