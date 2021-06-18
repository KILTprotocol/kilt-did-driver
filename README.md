[![](https://user-images.githubusercontent.com/39338561/122415864-8d6a7c00-cf88-11eb-846f-a98a936f88da.png)
](https://kilt.io)

# KILT DID Driver

This driver resolves a given KILT [Decentralized Identifier](https://w3c-ccg.github.io/did-spec/) to the associated DID Document.

Among others, this driver is used in the Decentralized Identity Foundation's [Universal Resolver](https://github.com/decentralized-identity/universal-resolver).

## About

A containerized version of this driver is available on [KILT Protocol's dockerhub](https://hub.docker.com/r/kiltprotocol/kilt-did-driver).

## Dev setup

### Install

```bash
yarn
```

### Run with node

- (Once only: Install the required dependencies with `yarn`)
- Start the web server:

```bash
# run with the prod chain
npm run start

# OR run with the devnet chain
npm run start:devnet
```

- Make a request:

```bash
curl -X GET http://localhost:8080/1.0/identifiers/did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx
```

Expected output: DID Document as JSON:

```json
{
  "didDocument": {
    "@context": "https://w3id.org/did/v1",
    "id": "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx",
    "service": [
      {
        "type": "KiltMessagingService",
        "serviceEndpoint": "https://services.kilt.io:443/messaging"
      }
    ],
    "authentication": [
      {
        "type": "Ed25519SignatureAuthentication2018",
        "publicKey": [
          "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx#key-1"
        ]
      }
    ],
    "publicKey": [
      {
        "id": "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx#key-1",
        "type": "Ed25519VerificationKey2018",
        "controller": "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx",
        "publicKeyHex": "0x2203a7731f1e4362cb21ff3ef7ce79204e1891fc62c4657040753283a00300d8"
      },
      {
        "id": "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx#key-2",
        "type": "X25519Salsa20Poly1305Key2018",
        "controller": "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx",
        "publicKeyHex": "0xd0a90ed3b87db1ab599bd3cc0c8e0dc7ffcf2347299a6d494567a14f06861952"
      }
    ]
  },
  "resolverMetadata": {
    "duration": 676,
    "identifier": "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx",
    "driverId": "driver-kiltprotocol/kilt-did-driver",
    "didUrl": {
      "didUrlString": "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx",
      "did": {
        "didString": "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx",
        "method": "kilt",
        "methodSpecificId": "5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx"
      },
      "parametersMap": {},
      "path": ""
    }
  },
  "methodMetadata": {}
}
```

### Run with docker

In `kilt-did-driver`:

```bash
docker build -t kiltprotocol/kilt-did-driver .
# return a container ID e.g. 4cf5867afbce40876a5ca2467bdb14407199a2eda29a89df1f98514c77cce6bc:
docker run -p 49160:8080 -d kiltprotocol/kilt-did-driver:latest
# see a list of container IDs, copy the relevant one e.g. 16df22cc7c5f:
docker ps
# see the logs for your container (16df22cc7c5f is the container id copied at the previous step):
docker logs 16df22cc7c5f
```

The container should be running and logs should be visible.
To query, run (note the port `49160` due to port mapping):

`curl -X GET http://localhost:49160/1.0/identifiers/did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx`

Expected output: DID Document as JSON:

```json
{
  "didDocument": {
    "@context": "https://w3id.org/did/v1",
    "id": "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx",
    "service": [
      {
        "type": "KiltMessagingService",
        "serviceEndpoint": "https://services.kilt.io:443/messaging"
      }
    ],
    "authentication": [
      {
        "type": "Ed25519SignatureAuthentication2018",
        "publicKey": [
          "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx#key-1"
        ]
      }
    ],
    "publicKey": [
      {
        "id": "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx#key-1",
        "type": "Ed25519VerificationKey2018",
        "controller": "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx",
        "publicKeyHex": "0x2203a7731f1e4362cb21ff3ef7ce79204e1891fc62c4657040753283a00300d8"
      },
      {
        "id": "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx#key-2",
        "type": "X25519Salsa20Poly1305Key2018",
        "controller": "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx",
        "publicKeyHex": "0xd0a90ed3b87db1ab599bd3cc0c8e0dc7ffcf2347299a6d494567a14f06861952"
      }
    ]
  },
  "resolverMetadata": {
    "duration": 676,
    "identifier": "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx",
    "driverId": "driver-kiltprotocol/kilt-did-driver",
    "didUrl": {
      "didUrlString": "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx",
      "did": {
        "didString": "did:kilt:5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx",
        "method": "kilt",
        "methodSpecificId": "5CqJa4Ct7oMeMESzehTiN9fwYdGLd7tqeirRMpGDh2XxYYyx"
      },
      "parametersMap": {},
      "path": ""
    }
  },
  "methodMetadata": {}
}
```

### Upload the container to KILT Protocol DockerHub

The Universal Resolver retrieves the DID Driver from [KILT's dockerhub](https://hub.docker.com/u/kiltprotocol).

To push a new version of the KILT DID Driver onto DockerHub:

```bash
# tag and push as latest and with specific version number
docker build -t kiltprotocol/kilt-did-driver:1.2.0 .
docker tag kiltprotocol/kilt-did-driver:1.2.0 kiltprotocol/kilt-did-driver:latest
docker push kiltprotocol/kilt-did-driver:1.2.0
docker push kiltprotocol/kilt-did-driver:latest
```

### Other useful commands

#### Kill a container

```bash
# list container IDs:
docker ps
docker kill <containerID>
docker rm <containerID>
```

#### Run a clean build

Simply add `--no-cache` to a `docker build` command.
