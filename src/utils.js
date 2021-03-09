const { Did } = require("@kiltprotocol/sdk-js");
const Kilt = require("@kiltprotocol/sdk-js");

async function getDidViaChain(address) {
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
  if (!did) return null
  return did.documentStore;
}

module.exports = {
  getDidDocumentStorageLocation,
  getDidDocumentFromJsonResponse,
  isUrlFetchable
};
