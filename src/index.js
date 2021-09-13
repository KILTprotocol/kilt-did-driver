const express = require('express');
const { init } = require('@kiltprotocol/sdk-js');
const Did = require('@kiltprotocol/sdk-js')
const fetch = require('node-fetch');
const { PORT } = require('./config');
const { URI_DID } = require('./consts');
const {
  getDidDocumentStorageLocation,
  getDidDocumentFromJsonResponse,
  isUrlFetchable
} = require('./utils');
const { BLOCKCHAIN_NODE } = require('./config');

const driver = express();

async function start() {
  await init({ address: BLOCKCHAIN_NODE });

  // URI_DID is imposed by the universal-resolver
  driver.get(URI_DID, async (req, res) => {
    const { did } = req.params

    let resolvedDid
    try {
      resolvedDid = await Did.resolveDoc(did)
      // Throws if the address is not a valid checksum address
    } catch(error) {
      res.sendStatus(400)
      return
    }

    if (!resolvedDid) {
      res.sendStatus(404)
      return
    }

    console.log(resolvedDid)
    const exportedDidDocument = Did.exportToDidDocument(resolvedDid, 'application/json+ld')
    console.log(exportedDidDocument)
    res.sendStatus(200).send(exportedDidDocument)
  });

  driver.listen(PORT, () => {
    console.info(`🚀  KILT Resolver driver active on port ${PORT}...`);
  });
}

start();
