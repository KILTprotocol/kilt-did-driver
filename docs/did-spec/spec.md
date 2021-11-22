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

A light DID can be created via the KILT SDK as explained in the [official documentation][kilt-did-docs].

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

To write the new full DID on the KILT blockchain, the DID subject must first sign a SCALE-encoded `DidCreationDetails` object with the following structure:

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

where the fields `new_attestation_key`, `new_delegation_key`, and `new_service_details` are optional, and all the keys are represented as an enumeration indicating the key type and its value expressed as a vector of bytes.

The struct must be signed using the authentication key of the account used as the DID subject, i.e., `<did_identifier>`.

The struct and its signature must then be included in an extrinsic call and submitted to the KILT blockchain using the `did -> create(details, signature)` function.
The extrinsic can only be submitted by the KILT account specified in the `DidCreationDetails` in the `submitter` field.
When stored on chain, each key is stored under the identifier that is generated by hashing the provided value with the [Blake 2 algorithm][blake-2].

The information about the submitter is required to be included and signed by the DID subject because upon creation of a new DID on the KILT blockchain, a deposit is taken from the submitter's balance.
To make it possible for the deposit payer to claim back the deposit, KILT allows not only the DID subject, but also the deposit owner for a given DID, to delete that DID from the blockchain state.
This deposit is returned only upon deletion of the DID, to incentivise keeping on the blockchain only data that is still relevant and subsidising the removal of unnecessary storage space.

> For security reasons, a full DID can only be created once. After it is deactivated, it is permanently added to a "blacklist" which prevents a DID with the same identifier from being created again.
For more details, please visit the [Security Requirements](#security-requirements) section.

### Migrate a light DID to a full DID

KILT allows a light DID to be migrated to a full DID without invalidating any of the credentials that were issued to the light DID before migration.

This is possible because a light DID's main identifier is the encoding of a KILT public key, and the creation of a full DID requires proving ownership of the key associated with the DID identifier.
Hence, a light DID can be migrated to a full DID and the KILT blockchain ensures that both identities belong to the same subject, who was able to provide a valid signature to anchor the light DID on chain, upgrading it to a full one.

Once upgraded, a light DID becomes unusable, meaning that all the operations involving authentication of the DID subject must be performed using the currently active authentication key of the full DID.

### Update a light DID

A light DID does not support updates, as a change in any of the details would result in a differently encoded string which would indicate a completely different DID.

### Update a full DID

A full DID can be updated via a number of extrinsics that the KILT blockchain exposes. The extrinsics are:

- `did -> setAuthenticationKey(newKey)`
- `did -> addKeyAgreementKey(newKey)`
- `did -> removeKeyAgreementKey(keyId)`
- `did -> setAttestationKey(newKey)`
- `did -> removeAttestationKey()`
- `did -> setDelegationKey(newKey)`
- `did -> removeDelegationKey()`
- `did -> addServiceEndpoint(serviceEndpoint)`
- `did -> removeServiceEndpoint(serviceId)`

As the KILT blockchain supports batching of calls, it is possible to batch multiple of these extrinsics together and update multiple fields of a full DID in a single transaction.

The extrinsic or the batch thereof must be SCALE-encoded and signed using the authentication key of the DID being updated that is valid at the moment each transaction is evaluated.

The extrinsic and the signature can then be submitted by **any** KILT account to the KILT blockchain via the following extrinsic:

`did -> submitDidCall(didCall, signature)`

which will check the validity of the signature and the DID nonce, and proceeds to update the information as instructed in `didCall`.

## Deactivate a light DID

Being entirely off-chain, a light DID can be deleted by simply deleting the private element of the DID authentication key.
Furthermore, a light DID is also considered deactivated when it has been migrated and its full counterpart is deactivated.
This is by design, as it is assumed that the original authentication key of the light DID might be compromised, leading to the light DID being migrated and its keys rotated.

## Deactivate a full DID

A full DID can be deactivated in two ways: by the DID subject, and by the KILT account that paid the deposit for the DID to be written on chain.

In the first case, the DID subject needs to sign, without submitting, the following extrinsic with their authentication key:

```did -> delete(endpoints_to_remove)```

where `endpoints_to_remove` is a paramater required by the KILT blockchain to provide an upper limit on the extrinsic execution time.
The parameter value match the number of service endpoints that are stored on chain under the given DID at the time of deletion.
Providing a larger value would still be acceptable, while providing a smaller value results in a noop and an error.

The signed extrinsic can then be submitted following the same process as with DID updates, i.e., by calling the `did -> submitDidCall(didCall, signature)` extrinsic with any KILT account.

The second way to delete a full DID is by signing and submitting the following extrinsic:

```did -> reclaim_deposit(did_subject, endpoints_to_remove)```

where `did_subject` is the identifier of the full DID to delete, and `endpoints_to_remove` follows the same logic as above.
This is an extrinsic that must be signed and submitted directly by a KILT account, without going through a DID signing process as in the case of DID updates or DID deletion.
Nevertheless, not any KILT account can submit this extrinsic, but only the account that paid for the DID creation deposit.

The result of both `did -> delete(endpoints_to_remove)` and `did -> reclaim_deposit(did_subject, endpoints_to_remove)` is that all the details associated with the DID are deleted from the chain, the DID is added to an on-chain "blacklist" to avoid creating a new DID with the same identifier (see [Security Requirements](#security-requirements)), and the deposit is returned to its initial payer.

<h2 id="security-requirements">Security Requirements</h2>

## Privacy Requirements

## Reference Implementations

[did-core-spec]: https://www.w3.org/TR/did-core
[kilt-did-docs]: https://kiltprotocol.github.io/docs/docs/sdk/core-feature/did
[ss58]: https://github.com/paritytech/substrate/wiki/External-Address-Format-(SS58)
[kilt-sdk]: https://github.com/KILTprotocol/sdk-js
[cbor]: https://cbor.io/
[spiritnet-polkadot]: https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fspiritnet.kilt.io%2F#/explorer
[kilt-did-docs]: https://dev.kilt.io/docs/sdk/core-feature/did
[blake-2]: https://www.blake2.net/