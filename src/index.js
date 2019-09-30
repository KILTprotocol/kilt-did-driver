const express = require("express");
const { PORT, URI_DID } = require("./consts");
const { getDidDocStorageLocation, getKiltIdFromDid } = require("./utils");

// const sdk = require("@kiltprotocol/sdk-js");

// todo importing full sdk???
// todo document each function input and output
// todo javascript vs typescript???
// todo prep for errors: no did property, wrong did...
// todo proper log management
// proper setup: github hooks, linting
// see https://services.kilt.io/contacts/5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u

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
});

driver.listen(PORT, function() {
  console.log(
    "\x1b[42m\x1b[30m",
    `KILT Resolver driver active on port ${PORT} 🚀 `
  );
  // reset style
  console.log("\x1b[0m", ``);
});
