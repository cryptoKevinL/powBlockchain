  const fetch = require('node-fetch');
  const executePeerRequest = async (peers, type, data) => {
    console.log('peers', peers);
    console.log('executePeerRequest', type);
  
    let requests;
  
    switch(type) {
    //   case 'postPeer':
    //     requests = state.peers.map(peer => fetch(getPeerUri(peer, 'peers'), 
    //     {method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' }})
    //     .then(response => response.json()));
    //     break;
      case 'getData':
          //fetch(`${server}/balance/${value}`).then((response) => { return response.json();
        //requests = state.peers.map(peer => fetch(getPeerUri(peer, 'data')).then(response => response.json()));
        //requests = state.peers.map(peer => fetch(`${server}/balance/${value}`).then(response => response.json()));
        break;
    //   case 'postData':
    //     console.log('data', data);
    //     requests = state.peers.map(peer => fetch(getPeerUri(peer, 'data'), 
    //     {method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' }})
    //     .then(response => response.json()));
    //     break;
    }
  
    try {
      return await Promise.all(requests);
    } catch (e) {
      console.log('Failed fetch', e);
    }
  }

const broadcastPeerNotice = async (myAddress) => {
  //bootstrapping case here...
  //assume port 4000 (default) is satoshi
  if(myAddress == 4000)
    return;

  //bootstrapping again, assume if we are not 4000, the 
  //previous port/address is a peer
  const peer = myAddress - 1;

  let request = fetch(`http://localhost:${peer}/newPeer`, 
  {method: 'POST', body: JSON.stringify(peer), headers: { 'Content-Type': 'application/json' }})
  .then(response => response.json());

  try {
    return await Promise.all(request);
  } catch (e) {
    console.log('Failed fetch', e);
  }
}

module.exports = { executePeerRequest,
                   broadcastPeerNotice }