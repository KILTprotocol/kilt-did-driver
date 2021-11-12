[![](https://user-images.githubusercontent.com/39338561/122415864-8d6a7c00-cf88-11eb-846f-a98a936f88da.png)](https://kilt.io)

# KILT Decentralised Identifiers (DID) Method Specification

### Editors

- **Antonio Antonino** - KILT Protocol [antonio@kilt.io](mailto:antonio@kilt.io)
- **Maud Nalpas** - KILT Protocol

### Version History

- **v1.0** - Nov.12 2021
- **v0.1** - Mar.03 2019

---

## Abstract

This document defines a the KILT DID Method that conforms to the [DID Core W3C Spec][did-core-spec].
A KILT Decentralised Identifier (DID) is a string uniquely identifying each KILT user that allows them to create CTypes, issue/collect attestations, and create delegation hierarchies.
For more information about KILT DIDs and their usage, please visit our [official documentation][kilt-did-docs].

## Method Syntax

### DID Scheme and Identifiers

The KILT DID method is identified by the `kilt` scheme, as in the following example: `did:kilt:4nvZhWv71x8reD9gq7BUGYQQVvTiThnLpTTanyru9XckaeWa`.

The main identifier of a KILT DID is a KILT address, which is the [SS58-encoded][ss58] public signing key of a KILT account.
Since the KILT network identifier `38` is prefixed to the public key before encoding, a KILT address always starts with a `4`, and is followed by 47 base58 characters.
The official [KILT SDK][kilt-sdk] can be used to generate valid KILT accounts.

As the account generation uses 256-bit entropy, it is reasonable to assume that each KILT address will be unique, hence each KILT DID will be globally unique within the DID space.

The KILT DID supports two classes of identifiers, light and full.

### Light DIDs

A KILT light DID has the following structure:

```
kilt-did            = "did:kilt:light:"<key-encoding><did-identifier>(":"<additional-details>)?
key-encoding        = [0-9][0-9]
did-identifier      = <base-58-encoded-kilt-address>
additional-details  = <base-64-encoded-details>
```

where `<base-58-encoded-kilt-address>` is a KILT address, and `<base-64-encoded-details>` is the Base64-encoded and CBOR-serialised version of the additional light DID details, as explained below.

KILT light DIDs are entirely off-chain and support a single authentication key, an optional key agreement key, and unlimited service details.

The *authentication* key is encoded as the KILT address that forms the DID's `did-identifier` component. This is the key that is used by the DID subject to perform any operations allowed to light DIDs that require the DID subject's authentication.
To be able to correctly use the key for signature verification, its type, e.g., Ed25519, is encoded using two digits before the actual identifier: this gives KILT the possibility to introduce additional key types without breaking compatibility with previous versions.
The types of authentication keys supported by a light DID are `sr25519` over the `ristretto25519` curve, and `ed25519` over the `curve25519` curve.

The optional *encryption key*, if present, can be of type `x25519` over the `curve25519` curve.

Both the encryption key and *services*, if present upon light DID creation, are combined into a JSON-like structure, which is then serialised using [CBOR][cbor] and Base64-encoded.
The resulting string is then appended to the light DID identifier after adding an additional `:` to separate the main identifier representing the DID public authentication key from the additional details.

So for a light DID with the following details:

- public authentication key: an `sr25519` key with HEX `0x54c71c235773b82115f0744252369c13414fd0e8bad3e8feff462c6a4bb58a0f`
- public key agreement key: an `x25519` key with HEX `0xe46df9e623ec23d1b4866f9bce9e1c6face1f7dd3511fe59672ca8394f08c55e`
- services: `[{ id: 'my-service-id', type: ['my-service-type'], serviceEndpoint: ['my-service-url'] }]`

the resulting DID will be

`did:kilt:light:004pqDzaWi3w7TzYzGnQDyrasK6UnyNnW6JQvWRrq6r8HzNNGy:omFlomlwdWJsaWNLZXlYIORt+eYj7CPRtIZvm86eHG+s4ffdNRH+WWcsqDlPCMVeZHR5cGVmeDI1NTE5YXOBo2JpZG1teS1zZXJ2aWNlLWlkZXR5cGVzgW9teS1zZXJ2aWNlLXR5cGVkdXJsc4FubXktc2VydmljZS11cmw=`

This means that the length of a light DID is directly dependent on the amount of additional details that are encoded.
For simpler cases where only an authentication key is needed, the light DID will have a structure like `did:kilt:light:004pqDzaWi3w7TzYzGnQDyrasK6UnyNnW6JQvWRrq6r8HzNNGy`, which is the equivalent of taking the long DID above and remove everything after the last `":"`.

### Full DIDs

A KILT full DID has the following structure:

```
kilt-did            = "did:kilt:"<did-identifier>
did-identifier      = <base-58-encoded-kilt-address>
```

where `<base-58-encoded-kilt-address>` is a KILT address.

A full DID relies on the [KILT blockchain][spiritnet-polkadot] for management and resolution, it allows the storage of more than one authentication and one key agreement key, and allows the DID subject to perform other types of operations, e.g., issuing credentials, on the KILT blockchain.

An example of a KILT full DID is the one provided at the beginning of this document: `did:kilt:4nvZhWv71x8reD9gq7BUGYQQVvTiThnLpTTanyru9XckaeWa`.

## Method Operations

### Create a light DID

Creating a light DID can be done via the KILT SDK as explained in the [official documentation][kilt-did-docs].

The user needs to generate a new keypair using one of the supported algorithms, and this will be used as the authentication key for the new light DID.
Similarly, if a key agreement key is needed, the user proceeds to generate an additional keypair to be used for encryption.
A set of services can also be specified.

With the new information, the KILT SDK will generate a new instance of a light DID, which will have an identifier following the structure explained in the section above.

Via the KILT SDK, the light DID can then be used to sign arbitrary payloads and can obtain verifiable credentials linked to it.

### Create a full DID

In the same way, the [KILT official documentation][kilt-did-docs] explains the steps needed to generate a full DID from a set of keys.

A KILT full DID supports the following keys: an authentication key, several key agreement keys, an assertion key (used to write new CTypes and credentials on the KILT blockchain), and a delegation key (used to delegate attestation capabilities to other entities).

Each of authentication, assertion, and delegation key can be of one of the supported types: `sr25519` over the `ristretto25519` curve, `ed25519` over the `curve25519` curve, and `ecdsa` over the `secp256k1` curve.
For key agreement keys, currently only `x25519` over the `curve25519` curve is supported.

To write the new full DID on the KILT blockchain, the DID subject must first sign a `DidCreationDetails` object with the following structure:

```json
{
    "did": "<did_identifier>",
    "submitter": "<submitter_kilt_account>",
    "new_key_agreement_keys": "<set_of_new_key_agreement_keys",
    "new_attestation_key": "<new_attestation_key>",
    "new_delegation_key": "<new_delegation_key>",
    "new_service_details": "<set_of_new_services>"
}
```

where the fields `new_attestation_key`, `new_delegation_key`, and `new_service_details` are optional.

The struct must be signed using the authentication key of the account used as the DID subject, i.e., `<did_identifier>`.

The struct and its signature must then be included in an extrinsic call and submitted to the KILT blockchain using the `did -> create(details, signature)` function.
The extrinsic can only be submitted by the KILT account specified in the `DidCreationDetails` in the `submitter` field.

The information about the submitter is required to be included and signed by the DID subject because upon creation of a new DID on the KILT blockchain, a deposit is taken from the submitter's balance.
To make it possible for the deposit payer to claim back the deposit, KILT allows not only the DID subject, but also the deposit owner for a given DID to delete that DID from the blockchain state.
This deposit is returned only upon deletion of the DID, to incentivise keeping on the blockchain only data that is still relevant and subsidising the removal of unnecessary storage space.

## Security Requirements

## Privacy Requirements

## Reference Implementations

[did-core-spec]: https://www.w3.org/TR/did-core
[kilt-did-docs]: https://kiltprotocol.github.io/docs/docs/sdk/core-feature/did
[ss58]: https://github.com/paritytech/substrate/wiki/External-Address-Format-(SS58)
[kilt-sdk]: https://github.com/KILTprotocol/sdk-js
[cbor]: https://cbor.io/
[spiritnet-polkadot]: https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fspiritnet.kilt.io%2F#/explorer
[kilt-did-docs]: https://dev.kilt.io/docs/sdk/core-feature/did