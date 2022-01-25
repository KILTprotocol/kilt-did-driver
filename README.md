[![](https://user-images.githubusercontent.com/39338561/122415864-8d6a7c00-cf88-11eb-846f-a98a936f88da.png)
](https://kilt.io)

# KILT Universal DID Resolver Driver

This repository contains the KILT driver source code for the [DIF Universal Resolver](https://github.com/decentralized-identity/universal-resolver).
For the official KILT DID specification, please visit [the relative section](./docs/did-spec/spec.md).

## Dev setup

The driver is meant to be run as a driver for the DIF Universal Resolver. 
Nevertheless, it can also be run locally either as an HTTP server or a Docker container.

### Run with Node

Install the dependencies with `yarn`, then start the HTTP server with either `yarn start` to connect the driver to the official [Spiritnet network](https://polkadot.js.org/apps/?rpc=wss://spiritnet.kilt.io) or `yarn start:testnet` to connect it to the [Peregrine testnet](https://polkadot.js.org/apps/?rpc=wss://peregrine.kilt.io/parachain-public-ws ).
By default, the server will listen on port 8080.

### Run with Docker

To build and run the driver as a Docker container:

```bash
docker build -t kiltprotocol/kilt-did-driver .
# Map the container port 8080 to the host port 49160
docker run -p 49160:8080 --name kiltprotocol-did-driver -d kiltprotocol/kilt-did-driver:latest
# See the logs for the container
docker logs -f kiltprotocol-did-driver
```

### Pull from DockerHub

To pull the Docker image from DockerHub, run:

```bash
# Pull the image
docker pull kiltprotocol/kilt-did-driver:latest
# Run the image, as in the previous section
docker run -p 49160:8080 --name kiltprotocol-did-driver -d kiltprotocol/kilt-did-driver:latest
# See the logs for the container
docker logs -f kiltprotocol-did-driver
```

### Make a request

An example command to resolve a KILT DID via the driver running on port 8080 is the following:

```bash
curl -X GET http://localhost:8080/1.0/identifiers/did:kilt:4rNTX3ihuxyWkB7wG3oLgUWSBLa2gva1NBKJsBFm7jJZUYfc
```

Expected output:

```json
{
    "didResolutionMetadata": {
        "pattern": "^(did:kilt:.+)$",
        "driverUrl": "http://kilt-did-driver:8080/1.0/identifiers/",
        "duration": 292,
        "did": {
            "didString": "did:kilt:4rNTX3ihuxyWkB7wG3oLgUWSBLa2gva1NBKJsBFm7jJZUYfc",
            "methodSpecificId": "4rNTX3ihuxyWkB7wG3oLgUWSBLa2gva1NBKJsBFm7jJZUYfc",
            "method": "kilt"
        },
        "contentType": "application/did+ld+json",
        "convertedFrom": "application/did+json",
        "convertedTo": "application/did+ld+json"
    },
    "didDocument": {
        "id": "did:kilt:4rNTX3ihuxyWkB7wG3oLgUWSBLa2gva1NBKJsBFm7jJZUYfc",
        "verificationMethod": [
            {
                "id": "did:kilt:4rNTX3ihuxyWkB7wG3oLgUWSBLa2gva1NBKJsBFm7jJZUYfc#0x1c1dcca1a29abc3538294e2d746853349bc43d781de4fa013b6cef473e196dff",
                "controller": "did:kilt:4rNTX3ihuxyWkB7wG3oLgUWSBLa2gva1NBKJsBFm7jJZUYfc",
                "type": "Ed25519VerificationKey2018",
                "publicKeyBase58": "BHbmtWMReQ1rDMZryWKYSwjgtMo7WYnTWKJKdgNWDUYa"
            }
        ],
        "authentication": [
            "did:kilt:4rNTX3ihuxyWkB7wG3oLgUWSBLa2gva1NBKJsBFm7jJZUYfc#0x1c1dcca1a29abc3538294e2d746853349bc43d781de4fa013b6cef473e196dff"
        ]
    },
    "didDocumentMetadata": {
        "deactivated": false
    }
}
```