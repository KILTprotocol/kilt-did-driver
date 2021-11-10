"use strict";
/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeDid = exports.assembleDidFragment = exports.getDidAuthenticationSignature = exports.signWithDid = exports.signWithKey = exports.writeDidFromIdentity = exports.writeDidFromPublicKeysAndServices = exports.writeDidFromPublicKeys = exports.verifyDidSignature = exports.computeKeyId = exports.encodeDidPublicKey = exports.encodeServiceEndpoint = exports.encodeDidAuthorizedCallOperation = exports.encodeDidCreationOperation = exports.isINewPublicKey = exports.formatPublicKey = exports.validateDidSignature = exports.validateKiltDid = exports.getIdentifierFromKiltDid = exports.parseDidUrl = exports.getKiltDidFromIdentifier = exports.getSigningKeyTypeFromEncoding = exports.getEncodingForSigningKeyType = exports.LIGHT_DID_SUPPORTED_SIGNING_KEY_TYPES = exports.getSignatureAlgForKeyType = exports.CHAIN_SUPPORTED_KEY_TYPES = exports.CHAIN_SUPPORTED_ENCRYPTION_KEY_TYPES = exports.CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES = exports.LIGHT_KILT_DID_REGEX = exports.FULL_KILT_DID_REGEX = exports.KILT_DID_PREFIX = void 0;
const types_1 = require("@kiltprotocol/types");
const utils_1 = require("@kiltprotocol/utils");
const util_1 = require("@polkadot/util");
const util_crypto_1 = require("@polkadot/util-crypto");
const DefaultResolver_1 = require("./DidResolver/DefaultResolver");
const Did_chain_1 = require("./Did.chain");
exports.KILT_DID_PREFIX = 'did:kilt:';
// Matches the following full DIDs
// - did:kilt:<kilt_address>
// - did:kilt:<kilt_address>#<fragment>
exports.FULL_KILT_DID_REGEX = /^did:kilt:(?<identifier>4[1-9a-km-zA-HJ-NP-Z]{47})(?<fragment>#[^#\n]+)?$/;
// Matches the following light DIDs
// - did:kilt:light:00<kilt_address>
// - did:kilt:light:01<kilt_address>:<encoded_details>
// - did:kilt:light:10<kilt_address>#<fragment>
// - did:kilt:light:99<kilt_address>:<encoded_details>#<fragment>
exports.LIGHT_KILT_DID_REGEX = /^did:kilt:light:(?<auth_key_type>[0-9]{2})(?<identifier>4[1-9a-km-zA-HJ-NP-Z]{47,48})(?<encoded_details>:.+?)?(?<fragment>#[^#\n]+)?$/;
var CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES;
(function (CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES) {
    CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES["ed25519"] = "ed25519";
    CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES["sr25519"] = "sr25519";
    CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES["secp256k1"] = "secp256k1";
})(CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES = exports.CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES || (exports.CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES = {}));
var CHAIN_SUPPORTED_ENCRYPTION_KEY_TYPES;
(function (CHAIN_SUPPORTED_ENCRYPTION_KEY_TYPES) {
    CHAIN_SUPPORTED_ENCRYPTION_KEY_TYPES["x25519"] = "x25519";
})(CHAIN_SUPPORTED_ENCRYPTION_KEY_TYPES = exports.CHAIN_SUPPORTED_ENCRYPTION_KEY_TYPES || (exports.CHAIN_SUPPORTED_ENCRYPTION_KEY_TYPES = {}));
exports.CHAIN_SUPPORTED_KEY_TYPES = Object.assign(Object.assign({}, CHAIN_SUPPORTED_ENCRYPTION_KEY_TYPES), CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES);
const SignatureAlgForKeyType = {
    [CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES.ed25519]: 'ed25519',
    [CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES.sr25519]: 'sr25519',
    [CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES.secp256k1]: 'ecdsa-secp256k1',
};
function getSignatureAlgForKeyType(keyType) {
    return SignatureAlgForKeyType[keyType] || keyType;
}
exports.getSignatureAlgForKeyType = getSignatureAlgForKeyType;
var LIGHT_DID_SUPPORTED_SIGNING_KEY_TYPES;
(function (LIGHT_DID_SUPPORTED_SIGNING_KEY_TYPES) {
    LIGHT_DID_SUPPORTED_SIGNING_KEY_TYPES["ed25519"] = "ed25519";
    LIGHT_DID_SUPPORTED_SIGNING_KEY_TYPES["sr25519"] = "sr25519";
})(LIGHT_DID_SUPPORTED_SIGNING_KEY_TYPES = exports.LIGHT_DID_SUPPORTED_SIGNING_KEY_TYPES || (exports.LIGHT_DID_SUPPORTED_SIGNING_KEY_TYPES = {}));
const EncodingForSigningKeyType = {
    [LIGHT_DID_SUPPORTED_SIGNING_KEY_TYPES.sr25519]: '00',
    [LIGHT_DID_SUPPORTED_SIGNING_KEY_TYPES.ed25519]: '01',
};
const SigningKeyTypeFromEncoding = {
    '00': LIGHT_DID_SUPPORTED_SIGNING_KEY_TYPES.sr25519,
    '01': LIGHT_DID_SUPPORTED_SIGNING_KEY_TYPES.ed25519,
};
function getEncodingForSigningKeyType(keyType) {
    return EncodingForSigningKeyType[keyType] || null;
}
exports.getEncodingForSigningKeyType = getEncodingForSigningKeyType;
function getSigningKeyTypeFromEncoding(encoding) {
    var _a;
    return ((_a = SigningKeyTypeFromEncoding[encoding]) === null || _a === void 0 ? void 0 : _a.toString()) || null;
}
exports.getSigningKeyTypeFromEncoding = getSigningKeyTypeFromEncoding;
function getLightDidFromIdentifier(identifier, didVersion = 1) {
    const versionString = didVersion === 1 ? '' : `:v${didVersion}`;
    return exports.KILT_DID_PREFIX.concat(`light${versionString}:${identifier}`);
}
function getFullDidFromIdentifier(identifier, didVersion = 1) {
    const versionString = didVersion === 1 ? '' : `v${didVersion}:`;
    return exports.KILT_DID_PREFIX.concat(`${versionString}${identifier}`);
}
function getKiltDidFromIdentifier(identifier, didType, didVersion = 1) {
    if (identifier.startsWith(exports.KILT_DID_PREFIX)) {
        if (exports.FULL_KILT_DID_REGEX.exec(identifier) ||
            exports.LIGHT_KILT_DID_REGEX.exec(identifier)) {
            return identifier;
        }
        throw utils_1.SDKErrors.ERROR_INVALID_DID_FORMAT;
    }
    switch (didType) {
        case 'full':
            return getFullDidFromIdentifier(identifier, didVersion);
        case 'light':
            return getLightDidFromIdentifier(identifier, didVersion);
        default:
            throw utils_1.SDKErrors.ERROR_UNSUPPORTED_DID(didType);
    }
}
exports.getKiltDidFromIdentifier = getKiltDidFromIdentifier;
function parseDidUrl(didUrl) {
    var _a, _b, _c, _d, _e;
    let matches = (_a = exports.FULL_KILT_DID_REGEX.exec(didUrl)) === null || _a === void 0 ? void 0 : _a.groups;
    if (matches && matches.identifier) {
        const version = matches.version ? parseInt(matches.version, 10) : 1;
        return {
            did: getKiltDidFromIdentifier(matches.identifier, 'full', version),
            version,
            type: 'full',
            identifier: matches.identifier,
            fragment: (_b = matches.fragment) === null || _b === void 0 ? void 0 : _b.substring(1),
        };
    }
    // If it fails to parse full DID, try with light DID
    matches = (_c = exports.LIGHT_KILT_DID_REGEX.exec(didUrl)) === null || _c === void 0 ? void 0 : _c.groups;
    if (matches && matches.identifier && matches.auth_key_type) {
        const version = matches.version ? parseInt(matches.version, 10) : 1;
        const lightDidIdentifier = matches.auth_key_type.concat(matches.identifier);
        return {
            did: getKiltDidFromIdentifier(lightDidIdentifier, 'light', version),
            version,
            type: 'light',
            identifier: matches.auth_key_type.concat(matches.identifier),
            fragment: (_d = matches.fragment) === null || _d === void 0 ? void 0 : _d.substring(1),
            encodedDetails: (_e = matches.encoded_details) === null || _e === void 0 ? void 0 : _e.substring(1),
        };
    }
    throw utils_1.SDKErrors.ERROR_INVALID_DID_FORMAT(didUrl);
}
exports.parseDidUrl = parseDidUrl;
function getIdentifierFromKiltDid(did) {
    return parseDidUrl(did).identifier;
}
exports.getIdentifierFromKiltDid = getIdentifierFromKiltDid;
function validateKiltDid(input, allowFragment = false) {
    if (typeof input !== 'string') {
        throw TypeError(`DID string expected, got ${typeof input}`);
    }
    const { identifier, type, fragment } = parseDidUrl(input);
    if (!allowFragment && fragment) {
        throw utils_1.SDKErrors.ERROR_INVALID_DID_FORMAT(input);
    }
    switch (type) {
        case 'full':
            if (!util_crypto_1.checkAddress(identifier, 38)[0]) {
                throw utils_1.SDKErrors.ERROR_ADDRESS_INVALID(identifier, 'DID identifier');
            }
            break;
        case 'light':
            // Identifier includes the first two characters for the key type encoding
            if (!util_crypto_1.checkAddress(identifier.substring(2), 38)[0]) {
                throw utils_1.SDKErrors.ERROR_ADDRESS_INVALID(identifier, 'DID identifier');
            }
            break;
        default:
            throw utils_1.SDKErrors.ERROR_UNSUPPORTED_DID(input);
    }
    return true;
}
exports.validateKiltDid = validateKiltDid;
function validateDidSignature(input) {
    try {
        if (!util_1.isHex(input.signature) ||
            !validateKiltDid(input.keyId, true)) {
            throw utils_1.SDKErrors.ERROR_SIGNATURE_DATA_TYPE();
        }
        return true;
    }
    catch (e) {
        throw utils_1.SDKErrors.ERROR_SIGNATURE_DATA_TYPE();
    }
}
exports.validateDidSignature = validateDidSignature;
function formatPublicKey(keypair) {
    const { type, publicKey } = keypair;
    return { [type]: publicKey };
}
exports.formatPublicKey = formatPublicKey;
function isINewPublicKey(key) {
    if (typeof key === 'object') {
        const { publicKey, type } = key;
        return publicKey instanceof Uint8Array && typeof type === 'string';
    }
    return false;
}
exports.isINewPublicKey = isINewPublicKey;
function encodeDidCreationOperation(registry, { didIdentifier, submitter, keys = {}, endpoints = [] }) {
    const { [types_1.KeyRelationship.assertionMethod]: assertionMethodKey, [types_1.KeyRelationship.capabilityDelegation]: delegationKey, [types_1.KeyRelationship.keyAgreement]: encryptionKey, } = keys;
    // build did create object
    const didCreateRaw = {
        did: didIdentifier,
        submitter,
        newKeyAgreementKeys: encryptionKey ? [formatPublicKey(encryptionKey)] : [],
        newAttestationKey: assertionMethodKey
            ? formatPublicKey(assertionMethodKey)
            : undefined,
        newDelegationKey: delegationKey
            ? formatPublicKey(delegationKey)
            : undefined,
        newServiceDetails: endpoints.map((service) => {
            const { id, urls } = service;
            return { id, urls, serviceTypes: service.types };
        }),
    };
    return new (registry.getOrThrow('DidDidDetailsDidCreationDetails'))(registry, didCreateRaw);
}
exports.encodeDidCreationOperation = encodeDidCreationOperation;
function encodeDidAuthorizedCallOperation(registry, { didIdentifier, txCounter, call, submitter, blockNumber, }) {
    return new (registry.getOrThrow('DidAuthorizedCallOperation'))(registry, {
        did: didIdentifier,
        txCounter,
        call,
        blockNumber,
        submitter,
    });
}
exports.encodeDidAuthorizedCallOperation = encodeDidAuthorizedCallOperation;
function encodeServiceEndpoint(registry, endpoint) {
    return new (registry.getOrThrow('DidServiceEndpointsDidEndpoint'))(registry, {
        id: endpoint.id,
        serviceTypes: endpoint.types,
        urls: endpoint.urls,
    });
}
exports.encodeServiceEndpoint = encodeServiceEndpoint;
function encodeDidPublicKey(registry, key) {
    let keyClass;
    if (Object.values(CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES).includes(key.type)) {
        keyClass = 'PublicVerificationKey';
    }
    else if (Object.values(CHAIN_SUPPORTED_ENCRYPTION_KEY_TYPES).includes(key.type)) {
        keyClass = 'PublicEncryptionKey';
    }
    else {
        throw TypeError(`Unsupported key type; types currently recognized are ${Object.values(exports.CHAIN_SUPPORTED_KEY_TYPES)}`);
    }
    return new (registry.getOrThrow('DidPublicKey'))(registry, {
        [keyClass]: formatPublicKey(key),
    });
}
exports.encodeDidPublicKey = encodeDidPublicKey;
function computeKeyId(publicKey) {
    return utils_1.Crypto.hashStr(publicKey.toU8a());
}
exports.computeKeyId = computeKeyId;
function verifyDidSignatureFromDetails({ message, signature, keyId, keyRelationship, didDetails, }) {
    const key = keyRelationship
        ? didDetails === null || didDetails === void 0 ? void 0 : didDetails.getKeys(keyRelationship).find((k) => k.id === keyId)
        : didDetails === null || didDetails === void 0 ? void 0 : didDetails.getKey(keyId);
    if (!key ||
        key.controller !== didDetails.did ||
        !SignatureAlgForKeyType[key.type])
        return {
            verified: false,
            didDetails,
            key,
        };
    return {
        verified: utils_1.Crypto.verify(message, signature, key.publicKeyHex),
        didDetails,
        key,
    };
}
// Verify a DID signature given the key ID of the signature.
// A signature verification returns false if a migrated and then deleted DID is used.
async function verifyDidSignature({ message, signature, keyId, keyRelationship, resolver = DefaultResolver_1.DefaultResolver, }) {
    var _a;
    // resolveDoc can accept a key ID, but it will always return the DID details.
    const resolutionDetails = await resolver.resolveDoc(keyId);
    // Verification fails if the DID does not exist at all.
    if (!resolutionDetails) {
        return {
            verified: false,
        };
    }
    // Verification also fails if the DID has been deleted.
    if (resolutionDetails.metadata.deactivated) {
        return {
            verified: false,
        };
    }
    // Verification also fails if the signer is a migrated light DID.
    if (resolutionDetails.metadata.canonicalId) {
        return {
            verified: false,
        };
    }
    // Otherwise, the details used are either the migrated full DID details or the light DID details.
    const didDetails = (resolutionDetails.metadata.canonicalId
        ? (_a = (await resolver.resolveDoc(resolutionDetails.metadata.canonicalId))) === null || _a === void 0 ? void 0 : _a.details
        : resolutionDetails.details);
    return verifyDidSignatureFromDetails({
        message,
        signature,
        keyId,
        keyRelationship,
        didDetails,
    });
}
exports.verifyDidSignature = verifyDidSignature;
async function writeDidFromPublicKeys(signer, submitter, publicKeys) {
    const { [types_1.KeyRelationship.authentication]: authenticationKey } = publicKeys;
    if (!authenticationKey)
        throw Error(`${types_1.KeyRelationship.authentication} key is required`);
    const didIdentifier = util_crypto_1.encodeAddress(authenticationKey.publicKey, 38);
    const extrinsic = await Did_chain_1.generateCreateTx({
        signer,
        submitter,
        didIdentifier,
        keys: publicKeys,
        alg: getSignatureAlgForKeyType(authenticationKey.type),
        signingPublicKey: authenticationKey.publicKey,
    });
    const did = getKiltDidFromIdentifier(didIdentifier, 'full');
    return { extrinsic, did };
}
exports.writeDidFromPublicKeys = writeDidFromPublicKeys;
async function writeDidFromPublicKeysAndServices(signer, submitter, publicKeys, endpoints) {
    const { [types_1.KeyRelationship.authentication]: authenticationKey } = publicKeys;
    if (!authenticationKey)
        throw Error(`${types_1.KeyRelationship.authentication} key is required`);
    const didIdentifier = util_crypto_1.encodeAddress(authenticationKey.publicKey, 38);
    const extrinsic = await Did_chain_1.generateCreateTx({
        signer,
        submitter,
        didIdentifier,
        keys: publicKeys,
        alg: getSignatureAlgForKeyType(authenticationKey.type),
        signingPublicKey: authenticationKey.publicKey,
        endpoints,
    });
    const did = getKiltDidFromIdentifier(didIdentifier, 'full');
    return { extrinsic, did };
}
exports.writeDidFromPublicKeysAndServices = writeDidFromPublicKeysAndServices;
function writeDidFromIdentity(identity, submitter) {
    const { signKeyringPair } = identity;
    const signer = {
        sign: ({ data }) => Promise.resolve({
            data: signKeyringPair.sign(data),
            alg: getSignatureAlgForKeyType(signKeyringPair.type),
        }),
    };
    return writeDidFromPublicKeys(signer, submitter, {
        [types_1.KeyRelationship.authentication]: signKeyringPair,
        [types_1.KeyRelationship.keyAgreement]: Object.assign(Object.assign({}, identity.boxKeyPair), { type: 'x25519' }),
    });
}
exports.writeDidFromIdentity = writeDidFromIdentity;
async function signWithKey(toSign, key, signer) {
    const alg = getSignatureAlgForKeyType(key.type);
    const { data: signature } = await signer.sign({
        publicKey: utils_1.Crypto.coToUInt8(key.publicKeyHex),
        alg,
        data: utils_1.Crypto.coToUInt8(toSign),
    });
    return { keyId: key.id, signature, alg };
}
exports.signWithKey = signWithKey;
async function signWithDid(toSign, did, signer, whichKey) {
    let key;
    if (Object.values(types_1.KeyRelationship).includes(whichKey)) {
        // eslint-disable-next-line prefer-destructuring
        key = did.getKeys(types_1.KeyRelationship.authentication)[0];
    }
    else {
        key = did.getKey(whichKey);
    }
    if (!key) {
        throw Error(`failed to find key on FullDidDetails (${did.did}): ${whichKey}`);
    }
    return signWithKey(toSign, key, signer);
}
exports.signWithDid = signWithDid;
async function getDidAuthenticationSignature(toSign, did, signer) {
    const { keyId, signature } = await signWithDid(toSign, did, signer, types_1.KeyRelationship.authentication);
    return { keyId, signature: utils_1.Crypto.u8aToHex(signature) };
}
exports.getDidAuthenticationSignature = getDidAuthenticationSignature;
function assembleDidFragment(didUri, fragmentId) {
    return `${didUri}#${fragmentId}`;
}
exports.assembleDidFragment = assembleDidFragment;
// This function is tested in the DID integration tests, in the `DID migration` test case.
async function upgradeDid(lightDid, submitter, signer) {
    const didAuthenticationKey = lightDid.getKeys(types_1.KeyRelationship.authentication)[0];
    const didEncryptionKey = lightDid.getKeys(types_1.KeyRelationship.keyAgreement)[0];
    const newDidPublicKeys = {
        authentication: {
            publicKey: util_1.hexToU8a(didAuthenticationKey.publicKeyHex),
            type: didAuthenticationKey.type,
        },
    };
    if (didEncryptionKey) {
        newDidPublicKeys.keyAgreement = {
            publicKey: util_1.hexToU8a(didEncryptionKey.publicKeyHex),
            type: didEncryptionKey.type,
        };
    }
    const adjustedServiceEndpoints = lightDid.getEndpoints().map((service) => {
        // We are sure a fragment exists.
        const id = parseDidUrl(service.id).fragment;
        // We remove the service ID prefix (did:light:...) before writing it on chain.
        return Object.assign(Object.assign({}, service), { id });
    });
    return writeDidFromPublicKeysAndServices(signer, submitter, newDidPublicKeys, adjustedServiceEndpoints);
}
exports.upgradeDid = upgradeDid;
