const sdk = require("@kiltprotocol/sdk-js");

const express = require("express");
const driver = express();

// start it:
// node index.js
// curl -X GET  http://localhost:8080/1.0/identifiers/did:kilt:5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u

// see https://services.kilt.io/contacts/5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u

const PORT = 8080;
const URI_DID = "/1.0/identifiers/:did";
const STORAGE_URL = "https://services.kilt.io/contacts"; // TODO query the chain to get this
const PREFIX = "did:kilt:";

driver.get(URI_DID, function(req, res) {
  const did = req.params.did;
  const key = did.substring(PREFIX.length);
  const url = `${STORAGE_URL}/${key}`;

  fetch(url)
    .then(response => response.json())
    // jsonResponse.did is the did document
    .then(jsonResponse => {
      const didDocumentAsJSON = JSON.stringify(jsonResponse.did);
      res.send(didDocumentAsJSON);
    })
    .catch(reason => {
      console.log(reason);
      res.sendStatus(404);
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
