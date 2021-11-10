/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
import type { LightDidDetailsCreationOpts } from '../types';
export declare function checkLightDidCreationOptions(options: LightDidDetailsCreationOpts): void;
/**
 * Serialize the optional encryption key of an off-chain DID using the CBOR serialization algorithm and encoding the result in Base64 format.
 *
 * @param details The light DID details to encode.
 * @param details.encryptionKey The DID encryption key.
 * @param details.serviceEndpoints The DID service endpoints.
 * @returns The Base64-encoded and CBOR-serialized off-chain DID optional details.
 */
export declare function serializeAndEncodeAdditionalLightDidDetails({ encryptionKey, serviceEndpoints, }: Pick<LightDidDetailsCreationOpts, 'encryptionKey' | 'serviceEndpoints'>): string | null;
export declare function decodeAndDeserializeAdditionalLightDidDetails(rawInput: string, version?: number): Pick<LightDidDetailsCreationOpts, 'encryptionKey' | 'serviceEndpoints'>;
