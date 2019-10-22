// did
const URL_SCHEME_ID = "did";
const KILT_METHOD_ID = "kilt";
const PREFIX = `${URL_SCHEME_ID}:${KILT_METHOD_ID}:`;
// node
const BLOCKCHAIN_NODE = process.env.blockchainNode;
// server
const PORT = 8080;
const URI_DID = "/1.0/identifiers/:did";
const STORAGE_PROTOCOL = "https";

module.exports = Object.freeze({
  // did
  PREFIX,
  // node
  BLOCKCHAIN_NODE,
  // server
  PORT,
  URI_DID,
  STORAGE_PROTOCOL
});
