const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const SHA256 = require('js-sha256');

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

var EC = require('elliptic').ec;
var ec = new EC('secp256k1');

function trimPublickKey(fullPubKey){
  return fullPubKey;
  //return SHA256(fullPubKey).slice(16);
}

const key1 = ec.genKeyPair();
const publicKey1 = trimPublickKey(key1.getPublic().encode('hex'));
const privateKey1 = key1.getPrivate().toString('hex');
const key2 = ec.genKeyPair();
const publicKey2 = trimPublickKey(key2.getPublic().encode('hex'));
const privateKey2 = key2.getPrivate().toString('hex');
const key3 = ec.genKeyPair();
const publicKey3 = trimPublickKey(key3.getPublic().encode('hex'));
const privateKey3 = key3.getPrivate().toString('hex');

const balances = {
  [publicKey1]: 100,
  [publicKey2]: 50,
  [publicKey3]: 75,
}

function getShortPubFromPriv(address){
  const fullPubKey = ec.keyFromPrivate(address).getPublic('hex');
  const shortPub = trimPublickKey(fullPubKey);
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

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  console.log(`Key 1, Public: ${publicKey1} Private: ${privateKey1}`);
  console.log(`Key 2, Public: ${publicKey2} Private: ${privateKey2}`);
  console.log(`Key 3, Public: ${publicKey3} Private: ${privateKey3}`);
});
