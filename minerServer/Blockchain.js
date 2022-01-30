  
  //const fetch = require('node-fetch');
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

class Blockchain {
    //since this is a local blockchain, we differentiate miners by port number
    constructor(minerPort) {
      console.log(`blockchain constructor for miner: ${minerPort}`);
      this.mempool = [];
      this.isMining = false;
      this.blocks =[];
      this.minerPort = minerPort;
      //if we get update blocks from peers, we may as well stop mining the block we were doing
      this.blocksUpdatedExternally = false;  

      //lets ask for blocks no matter what, so we dont
      //have to do special cases for the genesis block
      //the very first miner of all time, will have to 
      //deal with a timeout here, a small price to pay
      //so we don't have to maintain the number of miners state
      this.getBlocksFromPeers();

      //if we didn't get any blocks from peers, we can 
      //start a new blockchain
      const genesisBlock = {
        height: 0,  
        previousHash: 0x0,
        transactions: [
          {
            sender: 'coinbase',
            recipient: minerPort.toString(),
            amount: 50
          }
        ],
        nonce: 34
      };
      this.blocks = [ genesisBlock ];

      this.mine();
    }

    //Get blocks from peers instead of starting new blockchain
    getBlocksFromPeers() {
        //submit request and wait for response first
        //executePeerRequest('getData');
        
    }

    mine(){
        this.isMining = true;       
      
        setInterval(() => {
        //break out of current POW loop, if someone else mined this block
        if(this.blocksUpdatedExternally){
          this.blocksUpdatedExternally = false;
          this.isMining = false;
          return;
        }

        console.log(`Miner: ${this.minerPort} mined a block`);

        //TODO:
        //broadcast successfully mined block
        
        }, 5000);
    }
}

module.exports = { Blockchain, executePeerRequest, broadcastPeerNotice }