// did
const URL_SCHEME_ID = "did";
const KILT_METHOD_ID = "kilt";
const PREFIX = `${URL_SCHEME_ID}:${KILT_METHOD_ID}:`;
// node
const NODE = "wss://full-nodes.kilt.io:9944";
// server
const PORT = 8080;
const URI_DID = "/1.0/identifiers/:did";
const PROTOCOL = "https";

module.exports = Object.freeze({
  // did
  PREFIX,
  // node
  NODE,
  // server
  PORT,
  URI_DID,
  PROTOCOL
});
