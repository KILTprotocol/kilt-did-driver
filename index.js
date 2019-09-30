const sdk = require("@kiltprotocol/sdk-js");
const express = require("express");
const driver = express();

// todo importing full sdk???
// todo document each function input and output
// todo javascript vs typescript???
// todo prep for errors: no did property, wrong did...
// todo proper log management

// start it:
// node index.js
// curl -X GET  http://localhost:8080/1.0/identifiers/did:kilt:5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u

// see https://services.kilt.io/contacts/5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u

// server
const PORT = 8080;
const URI_DID = "/1.0/identifiers/:did";
// const STORAGE_URL = "https://services.kilt.io/contacts"; // TODO query the chain to get this

// node
const NODE = "wss://full-nodes.kilt.io:9944";

// did consts
const URL_SCHEME_ID = "did";
const KILT_METHOD_ID = "kilt";
const PREFIX = `${URL_SCHEME_ID}:${KILT_METHOD_ID}:`;

function getDidDocStorageLocation(address) {
  return getDidViaChain(address).then(response => response.documentStore);
}

function getDidViaChain(address) {
  // todo should we reconnect each time??? or keep a connection open????
  // todo close connection
  sdk.default.connect(NODE);
  return sdk.Did.queryByAddress(address);
}

function getKiltIdFromDid(did) {
  return did.substring(PREFIX.length);
}

driver.get(URI_DID, function(req, res) {
  const did = req.params.did;
  const address = getKiltIdFromDid(did);

  getDidDocStorageLocation(address)
    .then(storageLocation => {
      console.log("RESP", storageLocation);
      return storageLocation;
    })
    .then(storageLocation => {
      // todo https vs other... ???
      fetch(`https:${storageLocation}`)
        .then(response => response.json())
        .then(jsonResponse => {
          // jsonResponse.did is the did document
          const didDocumentAsJSON = JSON.stringify(jsonResponse.did);
          res.send(didDocumentAsJSON);
        })
        .catch(reason => {
          console.log(reason);
          res.sendStatus(404);
        });
    });
});

driver.listen(PORT, function() {
  console.log(
    "\x1b[42m\x1b[30m",
    `KILT Resolver driver active on port ${PORT} 🚀 `
  );
  // reset style
  console.log("\x1b[0m", ``);
});
