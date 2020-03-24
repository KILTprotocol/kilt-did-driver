const express = require("express");
require("dotenv").config();
const { Did } = require("@kiltprotocol/sdk-js");
const { PORT } = require("./config");
const { URI_DID } = require("./consts");
const {
  getDidDocStorageLocation,
  getDidDocumentFromJsonResponse,
  isUrlFetchable
} = require("./utils");

const driver = express();

// URI_DID is imposed by the universal-resolver
driver.get(URI_DID, async function(req, res) {
  const { did } = req.params;
  try {
    const address = Did.getAddressFromIdentifier(did);
    try {
      let storageLocation = await getDidDocStorageLocation(address);
      if (!isUrlFetchable(storageLocation)) {
        // workaround to mitigate the absence of the protocol scheme in the storageLocation string of KILT DID objects that were stored on chain via the demo-client
        storageLocation = `https:${storageLocation}`;
      }
      console.info("Fetching DID Document...");
      fetch(storageLocation)
        .then(response => response.json())
        .then(jsonResponse => {
          const didDocumentAsJSON = JSON.stringify(
            getDidDocumentFromJsonResponse(jsonResponse)
          );
          console.info("OK DID Document found");
          res.send(didDocumentAsJSON);
        })
        .catch(err => {
          console.error(err);
          res.sendStatus(404);
        });
    } catch (err) {
      console.error(err);
      res.sendStatus(404);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(404);
  }
});

driver.listen(PORT, () => {
  console.info(`🚀  KILT Resolver driver active on port ${PORT}...`);
});
