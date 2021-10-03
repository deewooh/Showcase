#!/bin/bash

# if smart contract passes its tests then deploy it
# must be run by sourcing it e.g. '. deploySC.sh <SC-name>'
# prereqs:
#   - setup.sh was run already with '. setup.sh'
#   - SC name is name of a of the SC directory in smart-contracts
#   - npm test can be used in SC directory to test the SC
#   - fabric-samples directory is in the same directory as COMP6452-Project2

if [ $# -lt 1 ]
then
    echo "USAGE: source deploySC.sh <SC name> [test]"
    return 1
fi

if [ ! -d "smart-contracts/$1" ]
then
    echo "ERROR: directory ./$1 does not exist"
    exit 1
fi

cd ./smart-contracts/$1
npm install

if [ $2 = "test" ]
then
    if npm test
    then
        echo "TESTS PASSED"
    else
        echo "TESTS FAILED. Aborting.." 
    fi
    cd ../../
    return 1
fi

CC_name=`echo $1 | sed s/-chaincode$//`
cd ../../../fabric-samples/test-network
./network.sh deployCC -ccn $CC_name -ccp ../../COMP6452-Project2/smart-contracts/$1 -ccl javascript -c carchainchannel
cd ../../COMP6452-Project2
