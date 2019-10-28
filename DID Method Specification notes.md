

ntity which controls the private key which created the DID also effectively controls the associated DID Document.
This private key should be kept private.


TODO look at the resolver




Methods for ensuring key privacy are outside the scope of this document.




// including all cryptographic operations necessary to establish proof of deactivation

rights????????

transaction signature vs rights?

A given DID Document can be deleted on the chosen document store, and optionally replaced by a new one, as an update.

Only the did doc can be updated on the central registry. By simply uploading a new did doc. The user must be authenticated, e.g. by using the authentication method in the DID Document.

## Operation: Delete

To make 
DID Document Updating and Deleting
IPFS addresses are hashes of their content, so an updated DID Document will also have a new IPFS address. Thus updating simply uses the setRecord smartcontract function again with the same DID and the new IPFS hash of the updated DID Document. Deletion, similarly, is updating the registry to return an all-0 byte string, as if it had never been initialised.

7.2.1 Create
The DID method specification MUST specify how a client creates a DID and its associated DID Document on the DID Registry, **including all cryptographic operations necessary to establish proof of control.**

7.2.2 Read/Verify
The DID method specification MUST specify how a client uses a DID to request a DID Document from the DID Registry, including how the client can verify the authenticity of the response.

7.2.3 Update
The DID method specification MUST specify how a client can update a DID Document on the DID Registry, including all cryptographic operations necessary to establish proof of control, or state that updates are not possible.

7.2.4 Deactivate
Although a core feature of distributed ledgers is immutability, the DID method specification MUST specify how a client can deactivate a DID on the DID Registry, including all cryptographic operations necessary to establish proof of deactivation or state that deactivation is not possible.


delete vs delete


# Tickets ideas:
* create a Did from scratch
* make the utility functions available
* refactor all
* move all utility functions to the SDK
* SERVICE_KILT_MESSAGING should be modifiable
* function getKiltIdFromDid(did) {
  // return sdk.getAddressFromIdentifier(did);
  // console.log(did);
  return did.substring(PREFIX.length);
}


## TBD
+ what type of key etc???
+ authentication default?
+ regsitry
+ remove = ??
+ and its associated DID Document on the DID Registry, 
+ including all cryptographic operations necessary to establish proof of control.
also some keys are NOT useful.

here's what is stored on chain.
Then, you would store the DID.

Question:
what is authenticate used for??


### Why #key-1? ("fragment")

This is just an id for this key inside the DIDS do, so that the DID Doc can be queried for only this keys if need be:
DidDoc#key-1 --> 
{
  "id": "did:kilt:5CtPYoDuQQFLe1JU5F8KHLXkKaWxLkKH1dBAfHrUU8SoxASr#key-1",
  "type": "Ed25519VerificationKey2018",
  "controller": "did:kilt:5CtPYoDuQQFLe1JU5F8KHLXkKaWxLkKH1dBAfHrUU8SoxASr",
  "publicKeyHex": "0x245e26168c3393e9c7fce042637b980758e783840974f9fadce4c8fe6fc76cb9"
}

### How is Auth used in practice?

One first thing to note is that the `type` property contains a lot of information: by specifying the key type, it tells us how the signing scheme shall be used in practice.
`Ed25519SignatureAuthentication2018`
If we look at how assymetric signatures work, the receiver only needs the sender's public key to verify a message's integrity and the sender's "identity".
TO BE VERIFIED.
Now the question is: how is "authentication" used? Is it used for the DID itself (inception) or with the services??
TODO.
See ssh example, maybe?

### Is services.kilt.io:443/messaging even correct as a service endpoint, i thought it should point to me ?

TODO.
See example https://w3c-ccg.github.io/did-spec/#a-simple-example : apparently this works too. ...

### Why do i get "messaging" as a service endpoint?

... I think it's the default. To be fixed on DID creation.


### Why 2 elements in `publicKey` with the same ID?

TODO.

### Are the key types we specified in the KILT ID even OK?

TODO.

### Why is one key the same in authentication and publicKey?

TODO.

### Which operations are on what?

DIDs are resolved and deactivated
DID Documents are written and updated

### Update?

Only the did doc can be updated on the central registry. By simply uploading a new did doc. The user must be authenticated, e.g. by using the authentication method in the DID Document.
"Updates are not possible"... ???

### Delete?

Call remove.
This removes the signing key and the box key and the did documentStore. 
Why are signing key and the box key removed?
And how is did documentStore removed?

Did {
  identifier: 'did:kilt:5EKQuvctgh3JDXbnZZGwPfSFKzqhpWJa6FZBusRtuZMTExs9',
  publicSigningKey:
   '0x0000000000000000000000000000000000000000000000000000000000000000',
  publicBoxKey:
   '0x0000000000000000000000000000000000000000000000000000000000000000',
  documentStore: null }
* No doc store: now this did points to nothing.
* How is documentStore set to null?
* the dic doc is still there on the central registry. Is this OK?
TODO.

### Security and Privacy considerations

At least the following forms of attack MUST be considered: eavesdropping, replay, message insertion, deletion, modification, and man-in-the-middle. Potential denial of service attacks MUST be identified as well. If the protocol incorporates cryptographic protection mechanisms, it should be clearly indicated which portions of the data are protected and what the protections are (i.e., integrity only, confidentiality, and/or endpoint authentication, etc.). Some indication should also be given to what sorts of attacks the cryptographic protection is susceptible. Data which should be held secret (keying material, random seeds, etc.) should be clearly labeled. If the technology involves authentication, particularly user-host authentication, the security of the authentication method MUST be clearly specified.