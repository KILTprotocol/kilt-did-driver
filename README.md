# Dev setup

* (Once only: Install the required dependencies with `yarn start`)
* Start the web server:
  
  ```bash
  node index.js
  `

* Make a request:
  
  ```bash
  curl -X GET http://localhost:8080/1.0/identifiers/did:kilt:5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u
  // should output the did document as JSON:
    {"id":"did:kilt:5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u","authentication":{"type":"Ed25519SignatureAuthentication2018","publicKey":["did:kilt:5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u#key-1"]},"publicKey":[{"id":"did:kilt:5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u#key-1","type":"Ed25519VerificationKey2018","controller":"did:kilt:5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u","publicKeyHex":"0xc6d2aee1adceaed6fb742238c57851ee9ed77f6715a6765339cc91277d31eb04"},{"id":"did:kilt:5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u#key-2","type":"X25519Salsa20Poly1305Key2018","controller":"did:kilt:5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u","publicKeyHex":"0x1c1f6b8fa12f6bbd0e7e4283266b0ae8b3b321c14909f5cd47f293dda1cb8436"}],"@context":"https://w3id.org/did/v1","service":[{"type":"KiltMessagingService","serviceEndpoint":"//services.kilt.io:443/messaging"}]}
  ```