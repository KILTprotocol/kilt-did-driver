const Kilt = require("@kiltprotocol/sdk-js");
const { BLOCKCHAIN_NODE, PREFIX } = require("./consts");

async function getDidViaChain(address) {
  Kilt.default.connect(BLOCKCHAIN_NODE);
  return Kilt.Did.queryByAddress(address).finally(() =>
    // close chain connection
    Kilt.BlockchainApiConnection.getCached().then(blockchain => {
      blockchain.api.disconnect();
    })
  );
}

function isUrlFetchable(storageLocation) {
  const fetchableUrlPattern = new RegExp("^(http|https)://");
  return fetchableUrlPattern.test(storageLocation);
}

/* 
input: did:kilt:5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u
output: 5GZPvZadd2GWEZcUPEw2eentLsTZFoXjYPoozxsYJqaf6c5u 
*/
function getKiltIdFromDid(did) {
  return did.substring(PREFIX.length);
}

function getDidDocumentFromJsonResponse(jsonResponse) {
  return jsonResponse.did;
}

async function getDidDocStorageLocation(address) {
  const did = await getDidViaChain(address);
  return did.documentStore;
}

module.exports = {
  getDidDocStorageLocation,
  getKiltIdFromDid,
  getDidDocumentFromJsonResponse,
  isUrlFetchable
};
