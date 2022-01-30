const { getBlockHash, targetDifficulty, executePeerRequest } = require('./utils');
const SHA256 = require('js-sha256');
class Blockchain {
    //since this is a local blockchain, we differentiate miners by port number
    constructor(minerPort, minerPeers) {
      console.log(`blockchain constructor for miner: ${minerPort}`);
      this.mempool = [];
      this.isMining = false;
      this.blocks =[];
      this.minerPort = minerPort;
      this.minerPeers = minerPeers;
      //if we get update blocks from peers, we may as well stop mining the block we were doing
      this.blocksUpdatedExternally = false;  

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

    mine(){
        this.isMining = true;     
        
        let candidateNonce = 1;
      
        setInterval(() => {
          //break out of current POW loop, if someone else mined this block
          if(this.blocksUpdatedExternally){
            this.blocksUpdatedExternally = false;
            this.isMining = false;
            return;
          }

          const candidateBlock = {
            height: this.blocks.length,
            previousHash: getBlockHash(this.blocks[this.blocks.length - 1]),
            transactions: [
              {
                sender: 'coinbase',
                recipient: this.minerPort.toString(), //miner port is our address in this example for now until we add pub/priv keys
                amount: 50
              }
            ],
            nonce: candidateNonce
          };

          const candidateBlockStringified = JSON.stringify(candidateBlock);

          const candidateBlockHash = SHA256(candidateBlockStringified);

          candidateNonce++;

          if (BigInt(`0x${candidateBlockHash}`) < targetDifficulty) {
            console.log(`Miner: ${this.minerPort} mined a block`);
            console.log('candidateBlockHash', candidateBlockHash.toString());
            this.blocks.push(candidateBlock);

            //broadcast successfully mined block
            //feel as if this should happen in miner code, but currently too lazy to alert
            executePeerRequest(this.minerPort, this.minerPeers, 'minedBlock', { blocks: this.blocks });
            
            candidateNonce = 1;
          }
        }, 500);
    }
}

module.exports = { Blockchain }