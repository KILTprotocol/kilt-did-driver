// did
const URI_DID = "/1.0/identifiers/:did";
// blockchain node
const BLOCKCHAIN_NODE = process.env.KILT_BLOCKCHAIN_NODE;
// server
const PORT = 8080;

module.exports = Object.freeze({
  // node
  BLOCKCHAIN_NODE,
  // server
  PORT,
  URI_DID
});
