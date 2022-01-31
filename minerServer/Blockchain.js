const { getBlockHash, targetDifficulty, executePeerRequest } = require('./utils');
const SHA256 = require('js-sha256');
const Signature = require('elliptic/lib/elliptic/ec/signature');
class Blockchain {
    //since this is a local blockchain, we differentiate miners by port number initially
    //pubKey and privKey should not necessarily linked to the Blockchain Data Structure,
    //but for this simple weekend project this will have to do.
    constructor(minerPort, minerPeers, keyPair) {
      console.log(`blockchain constructor for miner: ${minerPort}`);
      this.mempool = [];
      this.isMining = false;
      this.blocks =[];
      this.minerPort = minerPort;
      this.minerPeers = minerPeers;
      this.keyPair = keyPair;

      //if we get update blocks from peers, we may as well stop mining the block we were doing
      this.blocksUpdatedExternally = false;  
      //TODO: again this will change but its a code simplification for a weekend project.
      this.coinbaseSig = "";

      //if we didn't get any blocks from peers, we can 
      //start a new blockchain
      let genesisBlock = {
        height: 0,  
        previousHash: 0x0,
        transactions: [
          {
            sender: 'coinbase',
            recipient: this.keyPair.getPublic().encode('hex'),
            amount: 50,
            signature: ""
          }
        ],
        nonce: 34,
        signature: ""
      };
      genesisBlock.transactions[0].signature = this.signTransaction(genesisBlock.transactions[0]);
      this.coinbaseSig = genesisBlock.transactions[0].signature;
      genesisBlock.signature = this.signBlock(genesisBlock);
      this.blocks = [ genesisBlock ];

      this.mine();
    }

    signTransaction(transactionToSign){
      const sender = transactionToSign.sender;
      const recipient = transactionToSign.recipient;
      const amount = transactionToSign.amount;

      const local = JSON.stringify({
        sender, recipient, amount
      });
      const msgHash = SHA256(local);
      const signature = this.keyPair.sign(msgHash.toString());
      return signature;
    }

    hashBlock(blockToHash){
      const height = blockToHash.height;
      const previousHash = blockToHash.previousHash;
      const transactions = blockToHash.transactions;
      const nonce = blockToHash.nonce;

      const local = JSON.stringify({
        height, previousHash, transactions, nonce
      });

      return SHA256(local);
    }
    signBlock(blockToSign){
      const msgHash = this.hashBlock(blockToSign);
      const signature = this.keyPair.sign(msgHash.toString());
      return signature;
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
                recipient: this.keyPair.getPublic().encode('hex'), //miner port is our address in this example for now until we add pub/priv keys
                amount: 50,
                signature: this.coinbaseSig
              }
            ],
            nonce: candidateNonce,
            signature: ""
          };
          const candidateBlockHash = this.hashBlock(candidateBlock);

          candidateNonce++;

          if (BigInt(`0x${candidateBlockHash}`) < targetDifficulty) {
            const blockSignature = this.signBlock(candidateBlock);
            candidateBlock.signature = blockSignature;
            console.log(`Miner: ${this.minerPort} mined a block`);
            console.log('candidateBlockHash', candidateBlockHash.toString());
            //console.log('candidateBlockSignature', blockSignature);
            this.blocks.push(candidateBlock);

            //broadcast successfully mined block
            //feel as if this should happen in miner code, but currently too lazy to alert
            executePeerRequest(this.minerPort, this.minerPeers, 'minedBlock', { blocks: this.blocks });

            //TODO: update our miners copy of balances too
            
            candidateNonce = 1;
          }
        }, 1000);
    }
}

module.exports = { Blockchain }