Work in process POW weekend project blockchain

1) Start the Mining Nodes using the script or manually (node index <port>)
- currently, we start with port 4000 and increment by 1, peer notification
  algorithm likely needs some work to get more robust.

2) start a client with: npx parcel index.html (building off Proj1) 
- Currently this client only talks to port 4000

Architecture:
- Miners compete to mine a block (typical hash POW)
- Once POW hash difficulty is obtained, miner announces to peers
- Signature is placed on Block and individual transactions
- Once other miners are notified, they also check the signature on 
  the block and each transaction
- if signatures are valid, update a local balance sheet
- TODO - need more testing from web app client
- TODO - print out pub/priv keys better to web client for use
- TODO - eventually things will crash, the BC struct gets too big to send 
         everything for every mined block.  

TODO: We need to print Pub/Priv keys for each node/miner to make it easier
