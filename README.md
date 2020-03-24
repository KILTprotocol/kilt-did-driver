<p align="center">
<img width="220" src="https://user-images.githubusercontent.com/9762897/67468312-9176b700-f64a-11e9-8d88-1441380a71f6.jpg">  
  <div align="center"><sup><a href="https://kilt.io">kilt.io</a></sup></div> 
</p>

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
  curl -X GET http://localhost:8080/1.0/identifiers/did:kilt:5GFs8gCumJcZDDWof5ETFqDFEsNwCsVJUj2bX7y4xBLxN5qT
  ```

Expected output: DID Document as JSON:

```json
{
  "id": "did:kilt:5GFs8gCumJcZDDWof5ETFqDFEsNwCsVJUj2bX7y4xBLxN5qT",
  "@context": "https://w3id.org/did/v1",
  "authentication": {
    "type": "Ed25519SignatureAuthentication2018",
    "publicKey": [
      "did:kilt:5GFs8gCumJcZDDWof5ETFqDFEsNwCsVJUj2bX7y4xBLxN5qT#key-1"
    ]
  },
  "publicKey": [
    {
      "id": "did:kilt:5GFs8gCumJcZDDWof5ETFqDFEsNwCsVJUj2bX7y4xBLxN5qT#key-1",
      "type": "Ed25519VerificationKey2018",
      "controller": "did:kilt:5GFs8gCumJcZDDWof5ETFqDFEsNwCsVJUj2bX7y4xBLxN5qT",
      "publicKeyHex": "0xb973dbeb639d1ccbe143c3f38e95afbc9951b6bc2bc865ab3fe1fa0dacd92816"
    },
    {
      "id": "did:kilt:5GFs8gCumJcZDDWof5ETFqDFEsNwCsVJUj2bX7y4xBLxN5qT#key-2",
      "type": "X25519Salsa20Poly1305Key2018",
      "controller": "did:kilt:5GFs8gCumJcZDDWof5ETFqDFEsNwCsVJUj2bX7y4xBLxN5qT",
      "publicKeyHex": "0x4a087176d183ff29cb3ddd55f3f804ef2c719232ad71ebd3dc29f47a24d91e7a"
    }
  ],
  "service": [
    {
      "type": "KiltMessagingService",
      "serviceEndpoint": "//services.kilt.io:443/messaging"
    }
  ]
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

`curl -X GET http://localhost:49160/1.0/identifiers/did:kilt:5GFs8gCumJcZDDWof5ETFqDFEsNwCsVJUj2bX7y4xBLxN5qT`

Expected output: DID Document as JSON:

```json
{
  "id": "did:kilt:5GFs8gCumJcZDDWof5ETFqDFEsNwCsVJUj2bX7y4xBLxN5qT",
  "@context": "https://w3id.org/did/v1",
  "authentication": {
    "type": "Ed25519SignatureAuthentication2018",
    "publicKey": [
      "did:kilt:5GFs8gCumJcZDDWof5ETFqDFEsNwCsVJUj2bX7y4xBLxN5qT#key-1"
    ]
  },
  "publicKey": [
    {
      "id": "did:kilt:5GFs8gCumJcZDDWof5ETFqDFEsNwCsVJUj2bX7y4xBLxN5qT#key-1",
      "type": "Ed25519VerificationKey2018",
      "controller": "did:kilt:5GFs8gCumJcZDDWof5ETFqDFEsNwCsVJUj2bX7y4xBLxN5qT",
      "publicKeyHex": "0xb973dbeb639d1ccbe143c3f38e95afbc9951b6bc2bc865ab3fe1fa0dacd92816"
    },
    {
      "id": "did:kilt:5GFs8gCumJcZDDWof5ETFqDFEsNwCsVJUj2bX7y4xBLxN5qT#key-2",
      "type": "X25519Salsa20Poly1305Key2018",
      "controller": "did:kilt:5GFs8gCumJcZDDWof5ETFqDFEsNwCsVJUj2bX7y4xBLxN5qT",
      "publicKeyHex": "0x4a087176d183ff29cb3ddd55f3f804ef2c719232ad71ebd3dc29f47a24d91e7a"
    }
  ],
  "service": [
    {
      "type": "KiltMessagingService",
      "serviceEndpoint": "//services.kilt.io:443/messaging"
    }
  ]
}
```

### Upload the container to KILT Protocol DockerHub

The Universal Resolver retrieves the DID Driver from [KILT's dockerhub](https://hub.docker.com/u/kiltprotocol).

To push a new version of the KILT DID Driver onto DockerHub:

```bash
# tag and push as latest and with specific version number
docker build -t kiltprotocol/kilt-did-driver:1.0.1 .
docker tag kiltprotocol/kilt-did-driver:1.0.1 kiltprotocol/kilt-did-driver:latest
docker push kiltprotocol/kilt-did-driver:1.0.1
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
