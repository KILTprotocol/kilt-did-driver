const express = require("express");
require("dotenv").config();
const { PORT, URI_DID } = require("./consts");
const {
  getDidDocStorageLocation,
  getDidDocumentFromJsonResponse,
  getKiltIdFromDid,
  isUrlFetchable
} = require("./utils");

const driver = express();

driver.get(URI_DID, async function(req, res) {
  const { did } = req.params;
  const address = getKiltIdFromDid(did);

  try {
    let storageLocation = await getDidDocStorageLocation(address);
    if (!isUrlFetchable(storageLocation)) {
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
});

driver.listen(PORT, () => {
  console.info(`🚀  KILT Resolver driver active on port ${PORT}...`);
});
