"use strict";
/**
 * Copyright 2018-2021 BOTLabs GmbH.
 *
 * This source code is licensed under the BSD 4-Clause "Original" license
 * found in the LICENSE file in the root directory of this source tree.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOnChainDidFromSeed = exports.createLightDidFromSeed = exports.createLocalDemoDidFromSeed = exports.DemoKeystore = exports.EncryptionAlgorithms = exports.SigningAlgorithms = void 0;
const util_crypto_1 = require("@polkadot/util-crypto");
const utils_1 = require("@kiltprotocol/utils");
const types_1 = require("@kiltprotocol/types");
const chain_helpers_1 = require("@kiltprotocol/chain-helpers");
const util_1 = require("@polkadot/util");
const Did_utils_1 = require("../Did.utils");
const DidDetails_1 = require("../DidDetails");
const __1 = require("..");
const FullDidDetails_utils_1 = require("../DidDetails/FullDidDetails.utils");
var SigningAlgorithms;
(function (SigningAlgorithms) {
    SigningAlgorithms["Ed25519"] = "ed25519";
    SigningAlgorithms["Sr25519"] = "sr25519";
    SigningAlgorithms["EcdsaSecp256k1"] = "ecdsa-secp256k1";
})(SigningAlgorithms = exports.SigningAlgorithms || (exports.SigningAlgorithms = {}));
var EncryptionAlgorithms;
(function (EncryptionAlgorithms) {
    EncryptionAlgorithms["NaclBox"] = "x25519-xsalsa20-poly1305";
})(EncryptionAlgorithms = exports.EncryptionAlgorithms || (exports.EncryptionAlgorithms = {}));
const supportedAlgs = Object.assign(Object.assign({}, EncryptionAlgorithms), SigningAlgorithms);
function signingSupported(alg) {
    return Object.values(SigningAlgorithms).some((i) => i === alg);
}
function encryptionSupported(alg) {
    return Object.values(EncryptionAlgorithms).some((i) => i === alg);
}
const KeypairTypeForAlg = {
    ed25519: 'ed25519',
    sr25519: 'sr25519',
    'ecdsa-secp256k1': 'ecdsa',
    'x25519-xsalsa20-poly1305': 'x25519',
};
/**
 * Unsafe Keystore for Demo Purposes. Do not use to store sensible key material!
 */
class DemoKeystore {
    constructor() {
        this.signingKeyring = new utils_1.Keyring();
        this.encryptionKeypairs = new Map();
    }
    getSigningKeyPair(publicKey, alg) {
        if (!signingSupported(alg))
            throw new Error(`alg ${alg} is not supported for signing`);
        const keyType = DemoKeystore.getKeypairTypeForAlg(alg);
        try {
            const keypair = this.signingKeyring.getPair(publicKey);
            if (keypair && keyType === keypair.type)
                return keypair;
        }
        catch (_a) {
            throw Error(`no key ${utils_1.Crypto.u8aToHex(publicKey)} for alg ${alg}`);
        }
        throw Error(`no key ${utils_1.Crypto.u8aToHex(publicKey)} for alg ${alg}`);
    }
    getEncryptionKeyPair(publicKey, alg) {
        if (!encryptionSupported(alg))
            throw new Error(`alg ${alg} is not supported for encryption`);
        const publicKeyHex = utils_1.Crypto.u8aToHex(publicKey);
        const keypair = this.encryptionKeypairs.get(publicKeyHex);
        if (!keypair)
            throw Error(`no key ${publicKeyHex} for alg ${alg}`);
        return keypair;
    }
    async generateSigningKeypair(opts) {
        const { seed, alg } = opts;
        await util_crypto_1.cryptoWaitReady();
        const keypairType = DemoKeystore.getKeypairTypeForAlg(alg);
        const keypair = this.signingKeyring.addFromUri(seed || util_crypto_1.randomAsHex(32), {}, keypairType);
        return { alg, publicKey: keypair.publicKey };
    }
    async generateEncryptionKeypair(opts) {
        const { seed, alg } = opts;
        const { secretKey, publicKey } = util_crypto_1.naclBoxKeypairFromSecret(seed ? util_crypto_1.blake2AsU8a(seed, 32 * 8) : util_crypto_1.randomAsU8a(32));
        return this.addEncryptionKeypair({ alg, secretKey, publicKey });
    }
    async generateKeypair({ alg, seed, }) {
        if (signingSupported(alg)) {
            return this.generateSigningKeypair({ alg, seed });
        }
        if (encryptionSupported(alg)) {
            return this.generateEncryptionKeypair({ alg, seed });
        }
        throw new Error(`alg ${alg} is not supported`);
    }
    async addSigningKeypair({ alg, publicKey, secretKey, }) {
        await util_crypto_1.cryptoWaitReady();
        if (this.signingKeyring.publicKeys.some((i) => util_1.u8aEq(publicKey, i)))
            throw new Error('public key already stored');
        const keypairType = DemoKeystore.getKeypairTypeForAlg(alg);
        const keypair = this.signingKeyring.addFromPair({ publicKey, secretKey }, {}, keypairType);
        return { alg, publicKey: keypair.publicKey };
    }
    async addEncryptionKeypair({ alg, secretKey, }) {
        const keypair = util_crypto_1.naclBoxKeypairFromSecret(secretKey);
        const { publicKey } = keypair;
        const publicKeyHex = utils_1.Crypto.u8aToHex(publicKey);
        if (this.encryptionKeypairs.has(publicKeyHex))
            throw new Error('public key already used');
        this.encryptionKeypairs.set(publicKeyHex, keypair);
        return { alg, publicKey };
    }
    async addKeypair({ alg, publicKey, secretKey, }) {
        if (signingSupported(alg)) {
            return this.addSigningKeypair({ alg, publicKey, secretKey });
        }
        if (encryptionSupported(alg)) {
            return this.addEncryptionKeypair({ alg, publicKey, secretKey });
        }
        throw new Error(`alg ${alg} is not supported`);
    }
    async sign({ publicKey, alg, data, }) {
        const keypair = this.getSigningKeyPair(publicKey, alg);
        const signature = keypair.sign(data, { withType: false });
        return { alg, data: signature };
    }
    async encrypt({ data, alg, publicKey, peerPublicKey, }) {
        const keypair = this.getEncryptionKeyPair(publicKey, alg);
        // this is an alias for tweetnacl nacl.box
        const { nonce, sealed } = util_crypto_1.naclSeal(data, keypair.secretKey, peerPublicKey);
        return { data: sealed, alg, nonce };
    }
    async decrypt({ publicKey, alg, data, peerPublicKey, nonce, }) {
        const keypair = this.getEncryptionKeyPair(publicKey, alg);
        // this is an alias for tweetnacl nacl.box.open
        const decrypted = util_crypto_1.naclOpen(data, nonce, peerPublicKey, keypair.secretKey);
        if (!decrypted)
            return Promise.reject(new Error('failed to decrypt with given key'));
        return { data: decrypted, alg };
    }
    // eslint-disable-next-line class-methods-use-this
    async supportedAlgs() {
        return new Set(Object.values(supportedAlgs));
    }
    async hasKeys(keys) {
        const knownKeys = [
            ...this.signingKeyring.publicKeys,
            ...[...this.encryptionKeypairs.values()].map((i) => i.publicKey),
        ];
        return keys.map((key) => knownKeys.some((i) => util_1.u8aEq(key.publicKey, i)));
    }
    static getKeypairTypeForAlg(alg) {
        return KeypairTypeForAlg[alg.toLowerCase()];
    }
}
exports.DemoKeystore = DemoKeystore;
/**
 * Creates an instance of [[FullDidDetails]] for local use, e.g., in testing. Will not work on-chain because identifiers are generated ad-hoc.
 *
 * @param keystore The keystore to generate and store the DID private keys.
 * @param mnemonicOrHexSeed The mnemonic phrase or HEX seed for key generation.
 * @param signingKeyType One of the supported [[SigningAlgorithms]] to generate the DID authentication key.
 *
 * @returns A promise resolving to a [[FullDidDetails]] object. The resulting object is NOT stored on chain.
 */
async function createLocalDemoDidFromSeed(keystore, mnemonicOrHexSeed, signingKeyType = SigningAlgorithms.Ed25519) {
    const did = Did_utils_1.getKiltDidFromIdentifier(util_crypto_1.encodeAddress(util_crypto_1.blake2AsU8a(mnemonicOrHexSeed, 32 * 8), 38), 'full');
    const generateKeypairForDid = async (derivation, alg, keytype) => {
        const seed = derivation
            ? `${mnemonicOrHexSeed}//${derivation}`
            : mnemonicOrHexSeed;
        const keyId = `${did}#${util_crypto_1.blake2AsHex(seed, 64)}`;
        const { publicKey } = await keystore.generateKeypair({
            alg,
            seed,
        });
        return {
            id: keyId,
            controller: did,
            type: keytype,
            publicKeyHex: utils_1.Crypto.u8aToHex(publicKey),
        };
    };
    return FullDidDetails_utils_1.newFullDidDetailsfromKeys({
        [types_1.KeyRelationship.authentication]: await generateKeypairForDid('', signingKeyType, signingKeyType),
        [types_1.KeyRelationship.assertionMethod]: await generateKeypairForDid('assertionMethod', signingKeyType, signingKeyType),
        [types_1.KeyRelationship.capabilityDelegation]: await generateKeypairForDid('capabilityDelegation', signingKeyType, signingKeyType),
        [types_1.KeyRelationship.keyAgreement]: await generateKeypairForDid('keyAgreement', EncryptionAlgorithms.NaclBox, 'x25519'),
    });
}
exports.createLocalDemoDidFromSeed = createLocalDemoDidFromSeed;
async function createLightDidFromSeed(keystore, mnemonicOrHexSeed, signingKeyType = SigningAlgorithms.Sr25519) {
    const authenticationPublicKey = await keystore.generateKeypair({
        alg: signingKeyType,
        seed: mnemonicOrHexSeed,
    });
    return new DidDetails_1.LightDidDetails({
        authenticationKey: {
            publicKey: authenticationPublicKey.publicKey,
            type: authenticationPublicKey.alg,
        },
    });
}
exports.createLightDidFromSeed = createLightDidFromSeed;
async function createOnChainDidFromSeed(paymentAccount, keystore, mnemonicOrHexSeed, signingKeyType = SigningAlgorithms.Ed25519) {
    const makeKey = (seed, alg) => keystore
        .generateKeypair({
        alg,
        seed,
    })
        .then((key) => (Object.assign(Object.assign({}, key), { type: DemoKeystore.getKeypairTypeForAlg(alg) })));
    const keys = {
        [types_1.KeyRelationship.authentication]: await makeKey(mnemonicOrHexSeed, signingKeyType),
        [types_1.KeyRelationship.assertionMethod]: await makeKey(`${mnemonicOrHexSeed}//assertionMethod`, signingKeyType),
        [types_1.KeyRelationship.capabilityDelegation]: await makeKey(`${mnemonicOrHexSeed}//capabilityDelegation`, signingKeyType),
        [types_1.KeyRelationship.keyAgreement]: await makeKey(`${mnemonicOrHexSeed}//keyAgreement`, EncryptionAlgorithms.NaclBox),
    };
    const { extrinsic, did } = await __1.DidUtils.writeDidFromPublicKeys(keystore, paymentAccount.address, keys);
    await chain_helpers_1.BlockchainUtils.signAndSubmitTx(extrinsic, paymentAccount, {
        reSign: true,
        resolveOn: chain_helpers_1.BlockchainUtils.IS_IN_BLOCK,
    });
    const queried = await __1.DefaultResolver.resolveDoc(did);
    if (queried) {
        return queried.details;
    }
    throw Error(`failed to write Did${did}`);
}
exports.createOnChainDidFromSeed = createOnChainDidFromSeed;
