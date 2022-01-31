const { response } = require('express');
const fetch = require('node-fetch');
const SHA256 = require('js-sha256');
const executePeerRequest = async (from, peers, apiCmd, data) => {
    console.log('from: ', from);
    console.log('peers: ', peers);
    console.log('executePeerRequest: ', apiCmd);
  
    let requests;

    //if peers is null return
    if(!peers){
        return;
    }
  
    if(data) {
        //console.log('data', data);
        requests = peers.map(peer => fetch(`http://localhost:${peer}/${apiCmd}`, 
        {method: 'POST', body: JSON.stringify( {from, data} ), headers: { 'Content-Type': 'application/json' }})
        .then(response => response.json()));
    }
    else{
        requests = peers.map(peer => fetch(`http://localhost:${peer}/${apiCmd}`)
        .then(response => response.json()));
    }
  
    try {
      return await Promise.all(requests);
    } catch (e) {
      console.log('Failed fetch', e);
    }
  }

const broadcastPeerNotice = async (minerpeers, address) => {
  //bootstrapping case here...
  //assume port 4000 (default) is satoshi
  if(address == 4000)
    return;
  //bootstrapping again, assume if we are not 4000, the 
  //previous port/address is a peer
  const peer = address - 1;

  const body = JSON.stringify({
    address
  });

  const request = fetch( `http://localhost:${peer}/newPeer`, 
  {method: 'POST', body, headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ peerPort }) => {
    //console.log(`peerPort: ${peerPort}`);
    //console.log(`peerPortLength: ${peerPort.length}`);
    let tempArr = JSON.parse(peerPort);
    for(let i=0; i<tempArr.length; i++){
        minerpeers.push(tempArr[i]);
    }
    //minerpeers.push(peerPort); //add the returned peer list 
    minerpeers.push(peer.toString());  //add the bootstrapped peer
    console.log(`Peers: ${minerpeers}`);
  });
}

const targetDifficulty = BigInt(0x8ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);

const getBlockHash = block => {
    return SHA256(JSON.stringify(block)).toString();
}  

const getLongestBlockchain = async (allBlockchains) => {
    console.log('getLongestBlockchain');
  
    console.log('allBlockchains', allBlockchains);
  
    const validBlockchains = allBlockchains.filter(isValidBlockchain);
  
    console.log('validBlockchains', validBlockchains);
  
    let longestBlockchain = validBlockchains[0];
  
    for (let i = 1; i < validBlockchains.length; i++) {
      if (validBlockchains[i].block.length > longestBlockchain.blocks.length) {
        longestBlockchain = validBlockchains[i];
      }
    }
  
    console.log('longestBlockchain', longestBlockchain);
  
    return longestBlockchain;
  }

  const isValidBlockchain = blockchain => {
    if (!blockchain || !blockchain.length) return false;
  
    for (let i = 1; i < blockchain.blocks.length; i++ ) {
      if (blockchain.blocks[i].previousHash !== getBlockHash(blockchain.blocks[i - 1])) return false;
    }
  
    return true;
  }

module.exports = { executePeerRequest,
                   broadcastPeerNotice, 
                   targetDifficulty,
                   getBlockHash }