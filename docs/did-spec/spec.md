[![](https://user-images.githubusercontent.com/39338561/122415864-8d6a7c00-cf88-11eb-846f-a98a936f88da.png)](https://kilt.io)

# KILT Decentralised Identifiers (DID) Method Specification

### Editors

- **Antonio Antonino** - KILT Protocol [antonio@kilt.io](mailto:antonio@kilt.io)
- **Maud Nalpas** - KILT Protocol

### Version History

- **v1.2 - Mar.22 2022**: Add recently added support for web3 names
- **v1.1 - Jan.10 2022**: Switch light DID details encoding to use base58
- **v1.0 - Nov.12 2021**: Support new KILT DID specification for light and full DIDs
- **v0.1 - Mar.03 2019**: Support initial KILT DID design

---

## Abstract

This document defines a the KILT DID Method that conforms to the [DID Core W3C Spec][did-core-spec].
A KILT Decentralised Identifier (DID) is a string uniquely identifying entities within the KILT network, allowing them to create CTypes, issue/collect attestations, and create delegation hierarchies.
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
additional-details  = <base-58-encoded-details>
```

where `<base-58-encoded-kilt-address>` is a KILT address, and `<base-58-encoded-details>` is the Base58-encoded and CBOR-serialised version of the additional light DID details, as explained below.

KILT light DIDs are entirely off-chain and support a single authentication key, an optional key agreement key, and unlimited service details.

The *authentication* key is encoded as the KILT address that forms the DID's `did-identifier` component
This is the key that is used by the DID subject to perform any operations allowed to light DIDs that require the DID subject's authentication.
To be able to correctly use the key for signature verification, its type, e.g., Ed25519, is encoded using two digits before the actual identifier: this gives KILT the possibility to introduce additional key types without breaking compatibility with previous versions.
The types of authentication keys supported by a light DID are `sr25519`, and `ed25519`.

The optional *encryption key*, if present, can currently only be of type `x25519`.

Both the encryption key and *services*, if present upon light DID creation, are combined into a JSON-like structure, which is then serialised using [CBOR][cbor], flagged to indicate the serialisation strategy used, and Base58-multiencoded following the [multibase][multibase-repo] specification.
The resulting string is then appended to the light DID identifier after an additional `:` to separate the main identifier representing the DID public authentication key from the additional details.

Hence, for a light DID with the following details:

- public authentication key: an `sr25519` key with HEX `0x54c71c235773b82115f0744252369c13414fd0e8bad3e8feff462c6a4bb58a0f`
- public key agreement key: an `x25519` key with HEX `0xe46df9e623ec23d1b4866f9bce9e1c6face1f7dd3511fe59672ca8394f08c55e`
- services: `[{ id: 'my-service-id', type: ['my-service-type'], serviceEndpoint: ['my-service-url'] }]`

the resulting DID will be

`did:kilt:light:004pqDzaWi3w7TzYzGnQDyrasK6UnyNnW6JQvWRrq6r8HzNNGy:z14mMLbhZGB6YYU7ud2eFvUiHz3Mwo6UdttffCxB5s4hB3pxV2UgTQrgTyV6MZ8FAvqqKZQpxsJTFRYHzYhjzDUbxMtyxQtTrBu4F9YZx99AuEHuNSPCCd8RqpLeczkuDTGMP7eBDmmNbPbiXhKv5hb6ibYPCpZjUtjPBDqUQ1wXmBv3`

This means that the length of a light DID is directly dependent on the number of additional details that are encoded.
For simpler cases where only an authentication key is needed, the light DID will have a structure like `did:kilt:light:004pqDzaWi3w7TzYzGnQDyrasK6UnyNnW6JQvWRrq6r8HzNNGy`, which is the equivalent of taking the long DID above and removing everything after the last `":"` or, in other terms, generate a KILT account and prepend it with `did:kilt:`.

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

In the same way, the KILT [official documentation][kilt-did-docs] explains the steps required to generate a full DID from a given set of keys.

A KILT full DID supports the following keys: an authentication key, several key agreement keys, an assertion key (used to write new CTypes and credentials on the KILT blockchain), and a delegation key (used to delegate attestation capabilities to other entities).

Each authentication, assertion and delegation key can be of one of the supported types: `sr25519`, `ed25519`, and `ecdsa-secp256k1`.
For key agreement keys, currently, only `x25519` is supported.

To write the new full DID on the KILT blockchain, the DID subject must first sign a [SCALE][scale-encoding]-encoded `DidCreationDetails` object with the following structure:

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
When stored on chain, each key is stored under the identifier that is generated by hashing the provided value with the [Blake2-256 algorithm][blake-2].

The information about the submitter is required to be included and signed by the DID subject because upon the creation of a new DID on the KILT blockchain, a deposit is taken from the submitter's balance.
To make it possible for the deposit payer to claim back the deposit, KILT allows not only the DID subject but also the deposit owner for a given DID, to delete that DID from the blockchain state.
This deposit is returned only upon deletion of the DID to incentivise keeping data on the blockchain that is still relevant as well as to subsidise the removal of unnecessary storage items thus reducing the on-chain storage space.

> For security reasons, a full DID can only be created once.
After it is deactivated, it is permanently added to a "blacklist" which prevents a DID with the same identifier from being created again.
For more details, please visit the [Security Requirements](#security-requirements) section.

<h3 id="did-migration">Migrate a light DID to a full DID</h2>

KILT allows a light DID to be migrated to a full DID without invalidating any of the credentials that were issued to the light DID before migration.

This is possible because a light DID's main identifier is the encoding of a KILT public key, and the creation of a full DID requires proving ownership of the key associated with the DID identifier.
Hence, a light DID can be migrated to a full DID and the KILT blockchain ensures that both identities belong to the same subject, who was able to provide a valid signature to anchor the light DID on chain, upgrading it to a full one.

Once upgraded, a light DID becomes unusable, meaning that all the operations involving authentication of the DID subject must be performed using the currently active authentication key of the full DID.

### Add a web3 name to a full DID

Full DIDs can optionally claim a unique user-friendly alias called **Web3 name**, similar to what domain names are for IP addresses.
Each DID can only claim at most one web3 name, and each web3 name can be only claimed by one DID, with the KILT blockchain ensuring the unicity property.

A Web3 name can only contain lowercase ASCII characters, digits, and the symbols `-` and `_`.
The choice of restricting the set of characters to a subset of the ASCII charset with the addition of digits and some symbols ensures that no two Web3 name can look alike, as it would be the case of uppercase `O` and the digit `0`.
Web3 names can have a length included in the inclusive range [3, 32], with the following regex capturing all and only valid Web3 names: `^[a-z0-9\-\_]{3,32}$`.

The Web3 names live under the `web3_names` pallet, which expose both extrinsics to claim/release Web3 names, and storage to retrieve the owner of a given Web3 name and viceversa.

In a DID Document, if a DID has an associated Web3 name, this will appear under the `alsoKnownAs` field, which otherwise would be omitted.

### Resolve a DID

Resolution of a KILT DID is opaque over the type of DID being resolved.
There are two ways that KILT DIDs can be resolved: using the KILT SDK and using the DIF Universal Resolver.

In the first case, the KILT SDK exposes functions to resolve KILT DIDs referring to whole DID Documents, just a verification key by its ID, or just a service endpoint by its ID or its type.
For more details about the functions and types provided by the KILT SDK, please visit the [official SDK documentation][kilt-did-docs].

KILT also provides a resolution driver for the [DIF Universal Resolver][dif-universal-resolver].
In this case, the DID resolution process and result follow the [W3C DID Core Specification][did-core-spec] concerning the structure of the DID Document and the resolution metadata.

Specifically for resolution metadata, every DID resolution result contains document resolution metadata depending on the state of the DID being resolved:

<table>
<tr>
<td> DID status </td> <td> Metadata structure </td>
</tr>
<tr>
<td> Deleted DID </td>
<td>

```json
{
    "deactivated": true
}
```

</td>
</tr>
<tr>
<td> Migrated light DID with the full DID not deactivated </td>
<td>

```json
{
    "canonicalId": "did:kilt:<did_identifier>",
    "deactivated": false
}
```

</td>
</tr>
<tr>
<td> Un-migrated light DID or a full DID </td>
<td>

```json
{
    "deactivated": false
}
```

</td>
</tr>
</table>

In the first case where `deactivated` is true, the resulting `didDocument` will be a minimal document containing only the `id` and `@context` properties as specified in the DID Core specification.

On the KILT blockchain, information related to a full DID is stored under multiple storage maps within the `did` pallet, specifically:

- `did -> did(AccountId32): Option<DidDetails>`: maps from a DID identifier to its details, if present.
An instance of `DidDetails` contains all the keys under the control of the DID subject.
- `did -> didBlacklist(AccountId32): Option<()>`: maps from a DID identifier to an optional empty tuple indicating whether a given DID has been deleted (optional tuple is not null) or not (optional tuple is null).
- `did -> serviceEndpoints(AccountId32, Vec<u8>): Option<DidEndpoint>`: maps from the concatenation of hashed DID identifier and hashed service ID to the details of a service endpoint, if present.
Upon lookups, by only providing the first key, it is possible to retrieve all the service IDs under a given DID identifier.
An instance of `DidEndpoint` contains the service details, i.e., service ID, a set of service types, and a set of service URLs.

> The validity and authenticity of the information stored on the KILT blockchain are guaranteed by the same blockchain, which verifies that all DID management operations other than creation are signed by the DID authentication key, as described in the section relative to each operation.


### Update a light DID

A light DID does not support updates, as a change in any of the details would result in a differently encoded string which would indicate a completely different DID.

### Update a full DID

A full DID can be updated via some extrinsics that the KILT blockchain exposes.
The extrinsics are:

- `did -> setAuthenticationKey(newKey)`
- `did -> addKeyAgreementKey(newKey)`
- `did -> removeKeyAgreementKey(keyId)`
- `did -> setAttestationKey(newKey)`
- `did -> removeAttestationKey()`
- `did -> setDelegationKey(newKey)`
- `did -> removeDelegationKey()`
- `did -> addServiceEndpoint(serviceEndpoint)`
- `did -> removeServiceEndpoint(serviceId)`

As the KILT blockchain supports batching of calls, it is possible to batch multiple of these extrinsics together and update multiple fields of a full DID in a single batch transaction.

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

where `endpoints_to_remove` is a parameter required by the KILT blockchain to provide an upper limit on the extrinsic execution time.
The parameter value matches the number of service endpoints that are stored on chain under the given DID at the time of deletion.
Providing a larger value would still be acceptable while providing a smaller value results in a noop and an error.

The signed extrinsic can then be submitted following the same process as with DID updates, i.e., by calling the `did -> submitDidCall(didCall, signature)` extrinsic with any KILT account.

The second way to delete a full DID is by signing and submitting the following extrinsic:

```did -> reclaim_deposit(did_subject, endpoints_to_remove)```

where `did_subject` is the identifier of the full DID to delete, and `endpoints_to_remove` follows the same logic as above.
This is an extrinsic that must be signed and submitted directly by a KILT account, without going through a DID signing process as in the case of DID updates or DID deletion.
Nevertheless, not any KILT account can submit this extrinsic, but only the account that paid for the DID creation deposit.

The result of both `did -> delete(endpoints_to_remove)` and `did -> reclaim_deposit(did_subject, endpoints_to_remove)` is that all the details associated with the DID are deleted from the chain, the DID is added to an on-chain "blacklist" to avoid creating a new DID with the same identifier (see [Security Requirements](#security-requirements)), and the deposit is returned to its initial payer.

<h2 id="security-requirements">Security Requirements</h2>

The KILT blockchain is based on the Substrate blockchain framework, and as such, it heavily relies on its implementation for most of the cryptographic operations.
For instance, each KILT account has an associated nonce which is increased after each extrinsic submission by the account, to avoid replay attacks.
Extrinsics also have a limited validity period, called mortality, measured in block numbers, after which the signature is considered invalid.

## Replay attacks

As DIDs constitute a layer on top of the account layer, each DID also has a nonce associated, which is increased every time a DID-authorised operation is performed, e.g., a DID update or a CType creation.
A DID operation is considered valid only if `operation_nonce == current_nonce + 1`.
The nonce wraps around its maximum value, as each DID operation also has mortality, measured in blocks number.

Furthermore, information about deleted DIDs is permanently stored on the blockchain, so that their recreation is impossible.
This is done with the assumption that a full DID allows for key rotation, and one of the reasons why a DID subject might want to rotate the DID authentication key is because the key has been compromised.
Since the creation of a DID on chain requires a signature generated by the KILT account identified by the DID identifier, if that key was compromised (and then rotated) at some point during the lifetime of the DID, it should not be possible to re-create the same DID with the compromised key.
For this reason, once a DID is deleted it cannot be re-created.
Nevertheless, solutions like hierarchical key generation allow to generate new addresses, hence potentially new DIDs, starting from the same secret phrase or seed.

## Man-in-the-middle

To incentivise users to only keep the relevant data on the KILT blockchain, writing a DID requires locking up some KILTs of deposit which is then returned when the DID is deleted.
Since DIDs are decoupled from KILT accounts, a DID needs a KILT account with enough funds to pay for the creation deposit.
In order not to make the deposit payer dependent on the DID subject to delete the DID and obtain the deposit back, the KILT DID method also allows the deposit payer to delete the DID information from the blockchain and get the deposit refunded.

Hence, a DID creation operation requires the DID subject to explicitly specify the authorised submitter of the operation as part of the signed data.
This ensures that nobody can submit the DID creation operation on behalf of the designated user and, consequently, that nobody can delete a DID without the initial authorisation of the DID subject expressed as part of the creation operation signature.

## Denial-of-Service

The blockchain transactions (extrinsics) are subject to a fee depending on their raw length, on-chain computational intensity and storage requirements, similarly to the concept of gas in the Ethereum ecosystem, which represents real-world monetary value.
Hence, attempts to spam the blockchain with bogus transactions will either be blocked by a node before being included in a block, thus reducing the effect of such an attack, or they will result in an error while the attacker still needs to pay a transaction dispatch fee which, eventually, would exhaust the attacker resources.

## Operations integrity and authenticity

All operations are digitally signed by either the DID subject or the deposit payer.
Upon creating a full DID, the KILT blockchain verifies that the digital signature over the creation details was generated by the authentication key associated with the account that identifies the DID being created.
For instance, for a full DID in the form of `did:kilt:4nvZhWv71x8reD9gq7BUGYQQVvTiThnLpTTanyru9XckaeWa`, the authentication key associated with the `4nvZhWv71x8reD9gq7BUGYQQVvTiThnLpTTanyru9XckaeWa` KILT account must be used.
This process guarantees that upon its inception, the full DID is strongly linked to its light DID counterpart, making it possible to re-use any credentials that were issued to the light DID before it was migrated.
Beyond creation, each time an operation requiring a DID signature is required (via the `did -> submitDidCall(didCall, signature)`), the KILT blockchain verifies that the signature was generated with the DID authentication key active at that time.

## Privacy Requirements

As mentioned in the [migration section](#did-migration), a light DID and a full DID are, by design, strictly related once the former is upgraded to the latter.
Furthermore, currently, KILT supports verifiable credentials that are issued to a specific DID, hence the same DID needs to be revealed upon a credential presentation and the DID subject must prove ownership of the DID being used.

This opens the way to a range of tracking possibilities, and that is why, on one hand, KILT DIDs support light DIDs which are only shared and known between the DID subject and the other party.

Nevertheless, additional techniques including more advanced zero-knowledge proof (ZKP) schemes are under study that would allow a DID subject to not reveal the linking identifier in each credential presentation.

## Reference Implementations

The [KILT SDK][kilt-sdk] provides functionalities to manage light and full DIDs.
Furthermore, it exposes an interface for third-party resolvers to implement their own custom resolution logic.
The SDK provides a default resolver implementation that follows this specification.

[did-core-spec]: https://www.w3.org/TR/did-core
[ss58]: https://github.com/paritytech/substrate/wiki/External-Address-Format-(SS58)
[kilt-sdk]: https://github.com/KILTprotocol/sdk-js
[cbor]: https://cbor.io/
[spiritnet-polkadot]: https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fspiritnet.kilt.io%2F#/explorer
[kilt-did-docs]: https://dev.kilt.io/docs/sdk/core-feature/did
[blake-2]: https://www.blake2.net/
[dif-universal-resolver]: https://dev.uniresolver.io/
[scale-encoding]: https://docs.substrate.io/v3/advanced/scale-codec/
[multibase-repo]: https://github.com/multiformats/multibase#multibase-table