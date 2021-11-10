/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
import type { LightDidDetailsCreationOpts } from '../types';
import { DidDetails } from './DidDetails';
export declare class LightDidDetails extends DidDetails {
    static readonly LIGHT_DID_LATEST_VERSION = 1;
    constructor({ authenticationKey, encryptionKey, serviceEndpoints, }: LightDidDetailsCreationOpts);
}
