#!/bin/bash

# setup network and wallets

# tear down the network
cd ../fabric-samples/test-network
./network.sh down

# create the network
./network.sh up createChannel -c carchainchannel -ca

# generate the wallets
cd ../../COMP6452-Project2/utilities/wallet-generator
npm start
cd ../

# run the database generator
cd database-generator
npm start
cd ../../

# deploy the chaincodes
source deploySC.sh vehicle-chaincode
source deploySC.sh registration-chaincode
source deploySC.sh violation-chaincode
