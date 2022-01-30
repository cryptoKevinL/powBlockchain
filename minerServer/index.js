const express = require('express');
const app = express();
const cors = require('cors');
let port = 4000;
const SHA256 = require('js-sha256');
const { Blockchain, executePeerRequest, broadcastPeerNotice } = require('./Blockchain');

const serverForNodeManagement = `http://localhost:3042`;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

//pass in the port number
if(process.argv[2])
  port = process.argv[2]

var EC = require('elliptic').ec;
var ec = new EC('secp256k1');

//TODO: not sure we need this anymore
const balances = {
  // [publicKey1]: 100,
  // [publicKey2]: 50,
  // [publicKey3]: 75,
  1: 100,
  2: 50,
  3: 75,
}

//TODO:
//get list of peers
//for bootstrapping this BC, we could assume "addresses" are sequenetial.  
//They don't HAVE to be, but without this or a known list of "online"
//peers, we would have to hardcode it.  That would work too...
broadcastPeerNotice(port);

let minerCopyOfBlockchain = new Blockchain(port);
let minerPeers = [];
let minerAddress = port.toString();

//still neet to work this out if needed- incomplete
function getShortPubFromPriv(address){
  const fullPubKey = ec.keyFromPrivate(address).getPublic('hex');
  return fullPubKey;
  //return shortPub;
}

//newPeer
app.get('/newPeer/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  //res.send({ balance });
});

//if anyone calls this, return true
app.get('/checkPeerAlive', (req, res) => {
   res.send({ isAlive: true });
});

//if anyone calls this, return list of peers
app.get('/peerList', (req, res) => {
  res.send(minerPeers);
});

app.post('/peerList', (req, res) => {
  console.log('POST /peerList');
  console.log('req.body', req.body);

  //TODO: make this list unique
  minerPeers.push(req.body.peers)

  res.send("success");
});

app.post('/newPeer', (req, res) => {
  console.log('POST /newPeer');
  console.log('req.body', req.body);

  minerPeers.push(req.body.peer)

  //TODO: could optimize and return a list of our peers here
  res.send("success");
});

//if anyone calls this, return current list of blocks
app.get('/blockchainBlocks', (req, res) => {
  res.send(minerCopyOfBlockchain.blocks);
});

//when other miners successfully mine a block, they can 
//broadcast to all thier peers 
app.post('/minedBlock', (req, res) => {
  console.log('POST /minedBlock');
  console.log('req.body', req.body);
  const peerAddress = req.body.peerAddress;
  console.log(`Peer: ${peerAddress} has notified you of a POW mined block`)
  
  //TODO:
  //verify the hash and the transactions
  //This would likely be offloaded into a separate thread, 
  //but for a weekend project we are going to be lazy.  

  //Now verify that this blockchain is longer than the one we currently have
  //otherwise we would ignore the peer broadcast, as they are behind the times,
  //or they are trying to hack the blockchain and they are bad people
  if (req.body.blocks.length > minerCopyOfBlockchain.blocks.length) {
    console.log('Updating local blockchain');

    //stop the current mining going on, then update the blocks
    //and start mining again
    minerCopyOfBlockchain.blocksUpdatedExternally = true;
    while(minerCopyOfBlockchain.isMining);
    minerCopyOfBlockchain.blocks = req.body.blocks;
    minerCopyOfBlockchain.mine();
  }

  res.send(state.blockchain.toJson());
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  // console.log(`Key 1, Public: ${publicKey1} Private: ${privateKey1}`);
  // console.log(`Key 2, Public: ${publicKey2} Private: ${privateKey2}`);
  // console.log(`Key 3, Public: ${publicKey3} Private: ${privateKey3}`);
});
