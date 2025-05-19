const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 30 }); // TTL de 30 segundos

module.exports = cache;
