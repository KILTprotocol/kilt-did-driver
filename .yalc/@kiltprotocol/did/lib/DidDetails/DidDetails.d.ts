/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
import type { IDidDetails, IDidKeyDetails, IDidServiceEndpoint } from '@kiltprotocol/types';
import { KeyRelationship } from '@kiltprotocol/types';
import type { MapKeyToRelationship } from '../types';
/**
 * An abstract instance for some details associated with a KILT DID.
 */
export declare abstract class DidDetails implements IDidDetails {
    protected didUri: string;
    protected id: string;
    protected keys: Map<IDidKeyDetails['id'], IDidKeyDetails>;
    protected keyRelationships: MapKeyToRelationship & {
        none?: Array<IDidKeyDetails['id']>;
    };
    services: Map<string, IDidServiceEndpoint>;
    constructor(didUri: string, id: string, services: IDidServiceEndpoint[]);
    get did(): string;
    get identifier(): string;
    getKey(id: IDidKeyDetails['id']): IDidKeyDetails | undefined;
    getKeys(relationship?: KeyRelationship | 'none'): IDidKeyDetails[];
    getKeyIds(relationship?: KeyRelationship | 'none'): Array<IDidKeyDetails['id']>;
    getEndpointById(id: string): IDidServiceEndpoint | undefined;
    getEndpoints(): IDidServiceEndpoint[];
    getEndpointsByType(type: string): IDidServiceEndpoint[];
}
