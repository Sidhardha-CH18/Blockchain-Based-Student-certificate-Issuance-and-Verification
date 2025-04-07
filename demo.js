const { create } = require('ipfs-http-client');

// Connect to local IPFS node
const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' });

(async () => {
  const data = "Hello, IPFS!";
  const result = await ipfs.add(data);
  
  console.log("Generated CID:", result.cid.toString()); // Example: QmX... or bafy...
})();
