const express = require("express");
const { PORT, URI_DID } = require("./consts");
const { getDidDocStorageLocation, getKiltIdFromDid } = require("./utils");

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
