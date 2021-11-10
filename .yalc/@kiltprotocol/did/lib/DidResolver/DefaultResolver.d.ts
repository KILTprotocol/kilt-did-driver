/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
import type { IDidResolver, IDidKeyDetails, IDidResolvedDetails, IDidServiceEndpoint, IDidDetails } from '@kiltprotocol/types';
/**
 * Resolve a DID URI to the details of the DID subject.
 *
 * The URI can also identify a key or a service, but it will be ignored during resolution.
 *
 * @param did The subject's identifier.
 * @returns The details associated with the DID subject.
 */
export declare function resolveDoc(did: IDidDetails['did']): Promise<IDidResolvedDetails | null>;
/**
 * Resolve a DID key URI to the key details.
 *
 * @param didUri The DID key URI.
 * @returns The details associated with the key.
 */
export declare function resolveKey(didUri: IDidKeyDetails['id']): Promise<IDidKeyDetails | null>;
/**
 * Resolve a DID service URI to the service details.
 *
 * @param didUri The DID service URI.
 * @returns The details associated with the service endpoint.
 */
export declare function resolveServiceEndpoint(didUri: IDidServiceEndpoint['id']): Promise<IDidServiceEndpoint | null>;
/**
 * Resolve a DID URI (including a key ID or a service ID).
 *
 * @param didUri The DID URI to resolve.
 * @returns The DID, key details or service details depending on the input URI. If not resource can be resolved, null is returned.
 */
export declare function resolve(didUri: string): Promise<IDidResolvedDetails | IDidKeyDetails | IDidServiceEndpoint | null>;
export declare const DefaultResolver: IDidResolver;
