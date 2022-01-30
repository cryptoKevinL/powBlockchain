const { response } = require('express');
const fetch = require('node-fetch');
  const executePeerRequest = async (peers, apiCmd, data) => {
    console.log('peers: ', peers);
    console.log('executePeerRequest: ', apiCmd);
  
    let requests;

    //if peers is null return
    if(!peers)
        return;
  
    if(data) {
        console.log('data', data);
        requests = peers.map(peer => fetch(`http://localhost:${peer}/${apiCmd}`, 
        {method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' }})
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
    console.log(`Peers: ${peerPort}`);
    minerpeers.push(peerPort);
  });
}

module.exports = { executePeerRequest,
                   broadcastPeerNotice }