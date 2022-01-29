const genesisBlock = {
    height: 0,  
    previousHash: 0x0,
    transactions: [
      {
        sender: 'coinbase',
        recipient: 'kevin',
        amount: 50
      }
    ],
    nonce: 34
  };

  const executePeerRequest = async (type, data) => {
    console.log('peers', state.peers);
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

class Blockchain {
    //since this is a local blockchain, we differentiate miners by port number
    constructor(minerPort) {
      console.log(`blockchain constructor for miner: ${minerPort}`);
      this.mempool = [];
      this.isMining = false;
      this.blocks =[];
      this.minerPort = minerPort;

      //lets ask for blocks no matter what, so we dont
      //have to do special cases for the genesis block
      //the very first miner of all time, will have to 
      //deal with a timeout here, a small price to pay
      //so we don't have to maintain the number of miners state
      this.getBlocksFromPeers();

      //if we didn't get any blocks from peers, we can 
      //start a new blockchain
      this.blocks = [ genesisBlock ];

      this.mine();
    }

    //Get blocks from peers instead of starting new blockchain
    getBlocksFromPeers() {
        //submit request and wait for response first
        //executePeerRequest('getData');
        
    }

    mine(){
        setInterval(() => {
        console.log(`Miner: ${this.minerPort} mined a block`);
        }, 500);
    }
}

module.exports = { Blockchain }