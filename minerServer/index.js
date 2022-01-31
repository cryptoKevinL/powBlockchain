const express = require('express');
const app = express();
const cors = require('cors');
let port = 4000;
const SHA256 = require('js-sha256');
const { Blockchain } = require('./Blockchain');
const { executePeerRequest, broadcastPeerNotice } = require('./utils');

//TODO:
//Node Management Server could provide bootstrap type functions,
//like trusted peer lists for new node bringup
const serverForNodeManagement = `http://localhost:3042`;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

//pass in the port number
if(process.argv[2])
  port = process.argv[2]

var EC = require('elliptic').ec;
const e = require('express');
var ec = new EC('secp256k1');
const key = ec.genKeyPair();
//TODO: longer term, we would do this locally, and interface/wallet generate and store the private key
const publicKey = key.getPublic().encode('hex');
const privateKey = key.getPrivate().toString('hex');

//TODO: would we keep track of a local balance sheet for speed?
//balances would be similar to Ethereum, Bitcoin uses UTXO 
const balances = {
  // [publicKey1]: 100,
  // [publicKey2]: 50,
  // [publicKey3]: 75,
}

let minerPeers = new Array(); //originally was trying to keep this separate from BC data struct but got stuck/out of time
let minerCopyOfBlockchain = new Blockchain(port, minerPeers, key);
let minerAddress = port.toString();

//for bootstrapping this BC, we could assume "addresses" are sequenetial.  
//They don't HAVE to be, but without this or a known list of "online"
//peers, we would have to hardcode it.  That would work too...
broadcastPeerNotice(minerPeers, port);

//still neet to work this out if needed- incomplete
function getShortPubFromPriv(address){
  const fullPubKey = ec.keyFromPrivate(address).getPublic('hex');
  return fullPubKey;
  //return shortPub;
}

function clearArray(array) {
  while (array.length) {
    array.pop();
  }
}

// GET with parameters
// app.get('/newPeer/:address', (req, res) => {
//   const {address} = req.params;
//   const balance = balances[address] || 0;
//   //res.send({ balance });
// });

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

   // const tempMinerPeers = minerPeers.map(obj => obj);

  // //this seems messy, but I am using mutable references
  // //so we cannot simply set copy = minerPeers.  Doesn't work
  // //and even worse it doesn't throw any errors, its just undefined
  // clearArray(minerCopyOfBlockchain.minerPeers);

  // for(let i=0; i<tempMinerPeers.length; i++)
  //   minerCopyOfBlockchain.minerPeers.push(tempMinerPeers[i]);

  //TODO: make this list unique
  minerPeers.push(req.body.data.peers.toString());

  res.send("success");
});

app.post('/newPeer', (req, res) => {
  console.log('POST /newPeer');
  console.log('req.body', req.body);

  let peerPort = JSON.stringify(minerPeers);

  //now add the sent peer
  minerPeers.push(req.body.address.toString());

  console.log('returning peers', peerPort);
  res.send({ peerPort });
});

//if anyone calls this, return current list of blocks
app.get('/blockchainBlocks', (req, res) => {
  res.send(minerCopyOfBlockchain.blocks);
});

//when other miners successfully mine a block, they can 
//broadcast to all thier peers 
app.post('/minedBlock', (req, res) => {
  console.log('POST /minedBlock');
  //console.log('req.body', req.body);
  const peerAddress = req.body.from;
  const newBlocks = req.body.data.blocks;
  console.log(`Peer: ${peerAddress} has notified you of a POW mined block`)

  //Now verify that this blockchain is longer than the one we currently have
  //otherwise we would ignore the peer broadcast, as they are behind the times,
  //or they are trying to hack the blockchain and they are bad people
  const newBlocksLength = newBlocks.length;
  if (newBlocksLength > minerCopyOfBlockchain.blocks.length) {
    console.log('Updating local blockchain');

    //TODO:
    //verify the hash and the transactions
    //This would likely be offloaded into a separate thread, 
    //but for a weekend project we are going to be lazy.
    //TODO:we should only verify the "new" blocks not the entire 
    //blockchain, weekend project hack here.
    //find coinbase tx to grab publicKey (again a bit of a hack to not add yet another field)
    let signerPublicKey = "";
    let coinbaseIndex = 0;
    let amount = 0;
    //console.log('NewBlocks: ', newBlocks);
    for(let i=0; i<newBlocks[newBlocksLength-1].transactions.length; i++){
      if (newBlocks[newBlocksLength-1].transactions[i].sender == 'coinbase'){
        signerPublicKey = newBlocks[newBlocksLength-1].transactions[i].recipient;
        coinbaseIndex = i;
        amount = newBlocks[newBlocksLength-1].transactions[i].amount;
        break;
      }
    }
    const key = ec.keyFromPublic(signerPublicKey, 'hex');
    const blockHash = minerCopyOfBlockchain.hashBlock(newBlocks[coinbaseIndex]);
    const result = key.verify(blockHash, newBlocks[coinbaseIndex].signature);
    //update our local copy of the blanace sheet (if we are not using UTXOs)
    //TODO: this is only handling the coinbase TX
    if( result ){
      console.log("Verified Blockhash");
      // balances[sender] -= amount;
      balances[signerPublicKey] = (balances[signerPublicKey] || 0) + amount;
      // res.send({ balance: balances[sender] });
      console.log("Balances according to Miner: ", this.publicKey, balances);
    }
    else {
      console.log("Blockhash verify failed");
    }

    //stop the current mining going on, then update the blocks
    //and start mining again
    minerCopyOfBlockchain.blocksUpdatedExternally = true;
    // while(minerCopyOfBlockchain.isMining) 
    //   setTimeout(function(){console.log("for sleeping")}, 50);
    minerCopyOfBlockchain.blocks = newBlocks;
    minerCopyOfBlockchain.mine();
  }

  res.send(JSON.stringify(minerCopyOfBlockchain));
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  // console.log(`Key 1, Public: ${publicKey1} Private: ${privateKey1}`);
  // console.log(`Key 2, Public: ${publicKey2} Private: ${privateKey2}`);
  // console.log(`Key 3, Public: ${publicKey3} Private: ${privateKey3}`);
});
