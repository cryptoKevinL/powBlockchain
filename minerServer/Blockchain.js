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

module.exports = { Blockchain }