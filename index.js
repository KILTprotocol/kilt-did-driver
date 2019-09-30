const sdk = require("@kiltprotocol/sdk-js");
const express = require("express");

// todo importing full sdk???
// todo document each function input and output
// todo javascript vs typescript???
// todo prep for errors: no did property, wrong did...
// todo proper log management
// proper setup: github hooks, linting
// see https://services.kilt.io/contacts/5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u

// server
const PORT = 8080;
const URI_DID = "/1.0/identifiers/:did";

// node
const NODE = "wss://full-nodes.kilt.io:9944";

// did consts
const URL_SCHEME_ID = "did";
const KILT_METHOD_ID = "kilt";
const PREFIX = `${URL_SCHEME_ID}:${KILT_METHOD_ID}:`;

async function getDidDocStorageLocation(address) {
  const did = await getDidViaChain(address);
  return did.documentStore;
}

async function getDidViaChain(address) {
  sdk.default.connect(NODE);
  // this return value is thenable, finally will be called at last
  return sdk.Did.queryByAddress(address).finally(() =>
    // close chain connection
    sdk.BlockchainApiConnection.getCached().then(blockchain => {
      blockchain.api.disconnect();
    })
  );
}

function getKiltIdFromDid(did) {
  return did.substring(PREFIX.length);
}

const driver = express();

driver.get(URI_DID, async function(req, res) {
  const did = req.params.did;
  const address = getKiltIdFromDid(did);
  const storageLocation = await getDidDocStorageLocation(address);

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
  // getDidDocStorageLocation(address)
  //   .then(storageLocation => {
  //     console.log("RESP", storageLocation);
  //     return storageLocation;
  //   })
  //   .then(storageLocation => {
  //     // todo https vs other... ???

  //   });
});

driver.listen(PORT, function() {
  console.log(
    "\x1b[42m\x1b[30m",
    `KILT Resolver driver active on port ${PORT} 🚀 `
  );
  // reset style
  console.log("\x1b[0m", ``);
});
