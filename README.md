<p align="center">
<img width="220" src="https://user-images.githubusercontent.com/9762897/67468312-9176b700-f64a-11e9-8d88-1441380a71f6.jpg">  
  <div align="center"><sup><a href="kilt.io">kilt.io</a></sup></div> 
</p>

# KILT DID Driver

This driver resolves a given KILT [Decentralized Identifier](https://w3c-ccg.github.io/did-spec/) to the associated DID Document.

Among others, this driver can be used in the Decentralized Identity Foundation's [Universal Resolver](https://github.com/decentralized-identity/universal-resolver).

## About

A containerized version of this driver is available on [KILT Protocol's dockerhub](https://hub.docker.com/r/kiltprotocol/kilt-did-driver).

## Dev setup

### Run with node

* (Once only: Install the required dependencies with `yarn`)
* Start the web server:
  
  ```bash
  node src/index.js
  ```

* Make a request:
  
  ```bash
  curl -X GET http://localhost:8080/1.0/identifiers/did:kilt:5CtPYoDuQQFLe1JU5F8KHLXkKaWxLkKH1dBAfHrUU8SoxASr
  # exepcted output: DID Document as JSON:
    {"id":"did:kilt:5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u","authentication":{"type":"Ed25519SignatureAuthentication2018","publicKey":["did:kilt:5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u#key-1"]},"publicKey":[{"id":"did:kilt:5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u#key-1","type":"Ed25519VerificationKey2018","controller":"did:kilt:5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u","publicKeyHex":"0xc6d2aee1adceaed6fb742238c57851ee9ed77f6715a6765339cc91277d31eb04"},{"id":"did:kilt:5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u#key-2","type":"X25519Salsa20Poly1305Key2018","controller":"did:kilt:5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u","publicKeyHex":"0x1c1f6b8fa12f6bbd0e7e4283266b0ae8b3b321c14909f5cd47f293dda1cb8436"}],"@context":"https://w3id.org/did/v1","service":[{"type":"KiltMessagingService","serviceEndpoint":"//services.kilt.io:443/messaging"}]}
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

`curl -X GET http://localhost:49160/1.0/identifiers/did:kilt:5CtPYoDuQQFLe1JU5F8KHLXkKaWxLkKH1dBAfHrUU8SoxASr`

The response should be the following DID Document as JSON:

```json
{
  "id": "did:kilt:5CtPYoDuQQFLe1JU5F8KHLXkKaWxLkKH1dBAfHrUU8SoxASr",
  "authentication": {
    "type": "Ed25519SignatureAuthentication2018",
    "publicKey": [
      "did:kilt:5CtPYoDuQQFLe1JU5F8KHLXkKaWxLkKH1dBAfHrUU8SoxASr#key-1"
    ]
  },
  "publicKey": [
    {
      "id": "did:kilt:5CtPYoDuQQFLe1JU5F8KHLXkKaWxLkKH1dBAfHrUU8SoxASr#key-1",
      "type": "Ed25519VerificationKey2018",
      "controller": "did:kilt:5CtPYoDuQQFLe1JU5F8KHLXkKaWxLkKH1dBAfHrUU8SoxASr",
      "publicKeyHex": "0x245e26168c3393e9c7fce042637b980758e783840974f9fadce4c8fe6fc76cb9"
    },
    {
      "id": "did:kilt:5CtPYoDuQQFLe1JU5F8KHLXkKaWxLkKH1dBAfHrUU8SoxASr#key-2",
      "type": "X25519Salsa20Poly1305Key2018",
      "controller": "did:kilt:5CtPYoDuQQFLe1JU5F8KHLXkKaWxLkKH1dBAfHrUU8SoxASr",
      "publicKeyHex": "0xfb151a959ed0e01fd9748105c617497f329339ed22207b9185cc40c48b44e004"
    }
  ],
  "@context": "https://w3id.org/did/v1",
  "service": [
    {
      "type": "KiltMessagingService",
      "serviceEndpoint": "//services.kilt.io:443/messaging"
    }
  ]
}
```

Other useful commands:

```bash
# list container IDs:
docker ps
docker kill <containerID>
docker rm <containerID>
```

### Upload the container to KILT Protocol DockerHub

The Universal Resolver retrieves the DID Driver from [KILT's dockerhub](https://hub.docker.com/u/kiltprotocol).

To push a new version of the KILT DID Driver onto DockerHub, for use in the Universal Resolver:

```bash
docker build -t kiltprotocol/kilt-did-driver .  
docker push kiltprotocol/kilt-did-driver:latest
```
