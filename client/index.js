import * as styles from './index.scss'; 
const SHA256 = require('js-sha256');

const server = "http://localhost:3042";

var EC = require('elliptic').ec;
var ec = new EC('secp256k1');

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  const senderPrivKey = document.getElementById("sender-privateKey").value;
  const key = ec.keyFromPrivate(senderPrivKey);

  const bodyLocal = JSON.stringify({
    sender, amount, recipient
  });

  const msgHash = SHA256(bodyLocal);
  const signature = key.sign(msgHash.toString());
  const rSig = signature.r.toString(16);
  const sSig = signature.s.toString(16);

  const body = JSON.stringify({
    sender, amount, recipient, rSig, sSig
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});
