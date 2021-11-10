/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
import { KeyringPair, Keystore, KeystoreSigningData, NaclBoxCapable, RequestData, ResponseData } from '@kiltprotocol/types';
import { KeypairType } from '@polkadot/util-crypto/types';
import { FullDidDetails, LightDidDetails } from '../DidDetails';
export declare enum SigningAlgorithms {
    Ed25519 = "ed25519",
    Sr25519 = "sr25519",
    EcdsaSecp256k1 = "ecdsa-secp256k1"
}
export declare enum EncryptionAlgorithms {
    NaclBox = "x25519-xsalsa20-poly1305"
}
export interface KeyGenOpts<T extends string> {
    alg: RequestData<T>['alg'];
    seed?: string;
}
export interface NaclKeypair {
    publicKey: Uint8Array;
    secretKey: Uint8Array;
}
export declare type KeyAddOpts<T extends string> = Pick<RequestData<T>, 'alg'> & NaclKeypair;
/**
 * Unsafe Keystore for Demo Purposes. Do not use to store sensible key material!
 */
export declare class DemoKeystore implements Keystore<SigningAlgorithms, EncryptionAlgorithms>, NaclBoxCapable {
    private signingKeyring;
    private encryptionKeypairs;
    private getSigningKeyPair;
    private getEncryptionKeyPair;
    private generateSigningKeypair;
    private generateEncryptionKeypair;
    generateKeypair<T extends SigningAlgorithms | EncryptionAlgorithms>({ alg, seed, }: KeyGenOpts<T>): Promise<{
        publicKey: Uint8Array;
        alg: T;
    }>;
    private addSigningKeypair;
    private addEncryptionKeypair;
    addKeypair<T extends SigningAlgorithms | EncryptionAlgorithms>({ alg, publicKey, secretKey, }: KeyAddOpts<T>): Promise<{
        publicKey: Uint8Array;
        alg: T;
    }>;
    sign<A extends SigningAlgorithms>({ publicKey, alg, data, }: KeystoreSigningData<A>): Promise<ResponseData<A>>;
    encrypt<A extends 'x25519-xsalsa20-poly1305'>({ data, alg, publicKey, peerPublicKey, }: RequestData<A> & {
        peerPublicKey: Uint8Array;
    }): Promise<ResponseData<A> & {
        nonce: Uint8Array;
    }>;
    decrypt<A extends 'x25519-xsalsa20-poly1305'>({ publicKey, alg, data, peerPublicKey, nonce, }: RequestData<A> & {
        peerPublicKey: Uint8Array;
        nonce: Uint8Array;
    }): Promise<ResponseData<A>>;
    supportedAlgs(): Promise<Set<SigningAlgorithms | EncryptionAlgorithms>>;
    hasKeys(keys: Array<Pick<RequestData<string>, 'alg' | 'publicKey'>>): Promise<boolean[]>;
    static getKeypairTypeForAlg(alg: string): KeypairType;
}
/**
 * Creates an instance of [[FullDidDetails]] for local use, e.g., in testing. Will not work on-chain because identifiers are generated ad-hoc.
 *
 * @param keystore The keystore to generate and store the DID private keys.
 * @param mnemonicOrHexSeed The mnemonic phrase or HEX seed for key generation.
 * @param signingKeyType One of the supported [[SigningAlgorithms]] to generate the DID authentication key.
 *
 * @returns A promise resolving to a [[FullDidDetails]] object. The resulting object is NOT stored on chain.
 */
export declare function createLocalDemoDidFromSeed(keystore: DemoKeystore, mnemonicOrHexSeed: string, signingKeyType?: SigningAlgorithms): Promise<FullDidDetails>;
export declare function createLightDidFromSeed(keystore: DemoKeystore, mnemonicOrHexSeed: string, signingKeyType?: SigningAlgorithms): Promise<LightDidDetails>;
export declare function createOnChainDidFromSeed(paymentAccount: KeyringPair, keystore: DemoKeystore, mnemonicOrHexSeed: string, signingKeyType?: SigningAlgorithms): Promise<FullDidDetails>;
