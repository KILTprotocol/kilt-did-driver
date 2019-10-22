const sdk = require("@kiltprotocol/sdk-js");
const { BLOCKCHAIN_NODE, PREFIX } = require("./consts");

async function getDidViaChain(address) {
  sdk.default.connect(BLOCKCHAIN_NODE);
  // this return value is thenable, finally will be called at last
  return sdk.Did.queryByAddress(address).finally(() =>
    // close chain connection
    sdk.BlockchainApiConnection.getCached().then(blockchain => {
      blockchain.api.disconnect();
    })
  );
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
  getDidDocumentFromJsonResponse
};
