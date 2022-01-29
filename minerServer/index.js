const express = require('express');
const app = express();
const cors = require('cors');
let port = 4000;
const SHA256 = require('js-sha256');

const server = `http://localhost:3042`;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

//pass in the port number
if(process.argv[2])
  port = process.argv[2]

var EC = require('elliptic').ec;
const { Blockchain } = require('./Blockchain');
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

//broadcast successfully mined block

function getShortPubFromPriv(address){
  const fullPubKey = ec.keyFromPrivate(address).getPublic('hex');
  return shortPub;
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  const {sender, recipient, amount, rSig, sSig} = req.body;
  //const {sender, recipient, amount} = req.body;

  const bodyLocal = JSON.stringify({
    sender, amount, recipient
  });

  const signature = {
    r: rSig,
    s: sSig
  };

  const key = ec.keyFromPublic(sender, 'hex');
  const msgHash = SHA256(bodyLocal);
  const result = key.verify(msgHash, signature);

  if( result ){
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[sender] });
  }
});

let minerCopyOfBlockchain = new Blockchain();

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  // console.log(`Key 1, Public: ${publicKey1} Private: ${privateKey1}`);
  // console.log(`Key 2, Public: ${publicKey2} Private: ${privateKey2}`);
  // console.log(`Key 3, Public: ${publicKey3} Private: ${privateKey3}`);
});
