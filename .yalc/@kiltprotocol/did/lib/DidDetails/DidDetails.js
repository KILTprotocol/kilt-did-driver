"use strict";
/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DidDetails = void 0;
/**
 * An abstract instance for some details associated with a KILT DID.
 */
class DidDetails {
    constructor(didUri, id, services) {
        // A map from key ID to key details, which allows for efficient retrieval of a key information given its ID.
        this.keys = new Map();
        // A map from key relationship type (authentication, assertion method, etc.) to key ID, which can then be used to retrieve the key details if needed.
        this.keyRelationships = {};
        // A map from service endpoint ID to service endpoint details.
        this.services = new Map();
        this.didUri = didUri;
        this.id = id;
        services.forEach((service) => {
            this.services.set(service.id, service);
        });
    }
    get did() {
        return this.didUri;
    }
    get identifier() {
        return this.id;
    }
    getKey(id) {
        return this.keys.get(id);
    }
    getKeys(relationship) {
        if (relationship) {
            return this.getKeyIds(relationship).map((id) => this.getKey(id));
        }
        return [...this.keys.values()];
    }
    getKeyIds(relationship) {
        if (relationship) {
            return this.keyRelationships[relationship] || [];
        }
        return [...this.keys.keys()];
    }
    getEndpointById(id) {
        return this.services.get(id);
    }
    getEndpoints() {
        return Array.from(this.services.values());
    }
    getEndpointsByType(type) {
        return this.getEndpoints().filter((service) => service.types.includes(type));
    }
}
exports.DidDetails = DidDetails;
