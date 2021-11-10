/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
import type { DidSignature, IDidDetails, IDidResolver, IIdentity, IDidKeyDetails, KeystoreSigner, SubmittableExtrinsic, VerificationKeyRelationship, IDidServiceEndpoint } from '@kiltprotocol/types';
import { KeyRelationship } from '@kiltprotocol/types';
import type { Registry } from '@polkadot/types/types';
import type { PublicKeyEnum, IDidCreationOptions, IAuthorizeCallOptions, DidAuthorizedCallOperation, DidCreationDetails, DidPublicKey, INewPublicKey, PublicKeyRoleAssignment, IDidParsingResult, IServiceEndpointChainRecordCodec } from './types';
import { LightDidDetails } from '.';
export declare const KILT_DID_PREFIX = "did:kilt:";
export declare const FULL_KILT_DID_REGEX: RegExp;
export declare const LIGHT_KILT_DID_REGEX: RegExp;
export declare enum CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES {
    ed25519 = "ed25519",
    sr25519 = "sr25519",
    secp256k1 = "secp256k1"
}
export declare enum CHAIN_SUPPORTED_ENCRYPTION_KEY_TYPES {
    x25519 = "x25519"
}
export declare const CHAIN_SUPPORTED_KEY_TYPES: {
    ed25519: CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES.ed25519;
    sr25519: CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES.sr25519;
    secp256k1: CHAIN_SUPPORTED_SIGNATURE_KEY_TYPES.secp256k1;
    x25519: CHAIN_SUPPORTED_ENCRYPTION_KEY_TYPES.x25519;
};
export declare type CHAIN_SUPPORTED_KEY_TYPES = typeof CHAIN_SUPPORTED_KEY_TYPES;
export declare function getSignatureAlgForKeyType(keyType: string): string;
export declare enum LIGHT_DID_SUPPORTED_SIGNING_KEY_TYPES {
    ed25519 = "ed25519",
    sr25519 = "sr25519"
}
export declare function getEncodingForSigningKeyType(keyType: string): string;
export declare function getSigningKeyTypeFromEncoding(encoding: string): string;
export declare function getKiltDidFromIdentifier(identifier: string, didType: 'full' | 'light', didVersion?: number): string;
export declare function parseDidUrl(didUrl: string): IDidParsingResult;
export declare function getIdentifierFromKiltDid(did: string): string;
export declare function validateKiltDid(input: unknown, allowFragment?: boolean): input is IDidDetails['did'];
export declare function validateDidSignature(input: unknown): input is DidSignature;
export declare function formatPublicKey(keypair: INewPublicKey): PublicKeyEnum;
export declare function isINewPublicKey(key: unknown): key is INewPublicKey;
export declare function encodeDidCreationOperation(registry: Registry, { didIdentifier, submitter, keys, endpoints }: IDidCreationOptions): DidCreationDetails;
export declare function encodeDidAuthorizedCallOperation(registry: Registry, { didIdentifier, txCounter, call, submitter, blockNumber, }: IAuthorizeCallOptions): DidAuthorizedCallOperation;
export declare function encodeServiceEndpoint(registry: Registry, endpoint: IDidServiceEndpoint): IServiceEndpointChainRecordCodec;
export declare function encodeDidPublicKey(registry: Registry, key: INewPublicKey): DidPublicKey;
export declare function computeKeyId(publicKey: DidPublicKey): string;
export declare type VerificationResult = {
    verified: boolean;
    didDetails?: IDidDetails;
    key?: IDidKeyDetails;
};
export declare function verifyDidSignature({ message, signature, keyId, keyRelationship, resolver, }: {
    message: string | Uint8Array;
    signature: string | Uint8Array;
    keyId: IDidKeyDetails['id'];
    resolver?: IDidResolver;
    keyRelationship?: VerificationKeyRelationship;
}): Promise<VerificationResult>;
export declare function writeDidFromPublicKeys(signer: KeystoreSigner, submitter: IIdentity['address'], publicKeys: PublicKeyRoleAssignment): Promise<{
    extrinsic: SubmittableExtrinsic;
    did: string;
}>;
export declare function writeDidFromPublicKeysAndServices(signer: KeystoreSigner, submitter: IIdentity['address'], publicKeys: PublicKeyRoleAssignment, endpoints: IDidServiceEndpoint[]): Promise<{
    extrinsic: SubmittableExtrinsic;
    did: string;
}>;
export declare function writeDidFromIdentity(identity: IIdentity, submitter: IIdentity['address']): Promise<{
    extrinsic: SubmittableExtrinsic;
    did: string;
}>;
export declare function signWithKey(toSign: Uint8Array | string, key: IDidKeyDetails, signer: KeystoreSigner): Promise<{
    keyId: string;
    alg: string;
    signature: Uint8Array;
}>;
export declare function signWithDid(toSign: Uint8Array | string, did: IDidDetails, signer: KeystoreSigner, whichKey: KeyRelationship | IDidKeyDetails['id']): Promise<{
    keyId: string;
    alg: string;
    signature: Uint8Array;
}>;
export declare function getDidAuthenticationSignature(toSign: Uint8Array | string, did: IDidDetails, signer: KeystoreSigner): Promise<DidSignature>;
export declare function assembleDidFragment(didUri: IDidDetails['did'], fragmentId: string): string;
export declare function upgradeDid(lightDid: LightDidDetails, submitter: IIdentity['address'], signer: KeystoreSigner): Promise<{
    extrinsic: SubmittableExtrinsic;
    did: string;
}>;
