const { Did } = require("@kiltprotocol/sdk-js");
const Kilt = require("@kiltprotocol/sdk-js");
const { BLOCKCHAIN_NODE } = require("./config");

async function getDidViaChain(address) {
  await Kilt.default.init({ address: BLOCKCHAIN_NODE })
  Kilt.default.connect();
  return Did.queryByAddress(address);
}

function isUrlFetchable(storageLocation) {
  const fetchableUrlPattern = new RegExp("^(http|https)://");
  return fetchableUrlPattern.test(storageLocation);
}

function getDidDocumentFromJsonResponse(jsonResponse) {
  return jsonResponse.did;
}

async function getDidDocumentStorageLocation(address) {
  const did = await getDidViaChain(address);
  return did.documentStore;
}

module.exports = {
  getDidDocumentStorageLocation,
  getDidDocumentFromJsonResponse,
  isUrlFetchable
};
