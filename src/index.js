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
  const storageLocation = await getDidDocStorageLocation(address);

  if (isUrlFetchable(storageLocation)) {
    fetch(storageLocation)
      .then(response => response.json())
      .then(jsonResponse => {
        const didDocumentAsJSON = JSON.stringify(
          getDidDocumentFromJsonResponse(jsonResponse)
        );
        res.send(didDocumentAsJSON);
      })
      .catch(reason => {
        console.error(reason);
        res.sendStatus(404);
      });
  } else {
    console.error(
      `Protocol not supported. The KILT DID resolver only support fetchable URLs as DID Document location. But the storage location found for this document was "${storageLocation}".`
    );
    res.sendStatus(404);
  }
});

driver.listen(PORT, () => {
  console.info(`🚀  KILT Resolver driver active on port ${PORT}...`);
});
