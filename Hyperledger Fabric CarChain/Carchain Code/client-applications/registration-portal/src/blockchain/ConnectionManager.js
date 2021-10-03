/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const {buildCCPOrg1, buildWallet} = require('../../../../utilities/fabric-sdk/test-application/javascript/AppUtil.js');

// Connection details
const channelName = 'carchainchannel';
const walletPath = path.join(__dirname, '../', '../', '../', '../', 'utilities', 'wallet-generator', 'wallets', 'registry', 'wallet');
const org1UserId = 'RegistryPortal';


/**
 * Manages the Connection to Hyperledger Fabric
 */
class ConnectionManager {
    
    constructor() {
        // do nothing
    }

    /**
     * Initialises the connection to a chaincode instance deployed on Hyperledger Fabric
     * @param {String} chaincodeName The chancode to connect to
     * @returns {Contract} An instance of Hyperledger Fabric Contract
     */
    async init(chaincodeName) {
        let contract;
        try {
            this.ccp = buildCCPOrg1();
            this.wallet = await buildWallet(Wallets, walletPath);
            this.gateway = new Gateway();

			await this.gateway.connect(this.ccp, {
				wallet: this.wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true }
			});

			let network = await this.gateway.getNetwork(channelName);
			contract = network.getContract(chaincodeName);

        } catch (err) {
            throw (err);
        }
        return contract;
    }

    /**
     * Close the connection to a chaincode instance
     * @returns {String} 'SUCCESS' otherwise throws an error
     */
    disconnect() {
        try {
            this.gateway.disconnect();
        } catch (err) {
            throw err;
        }
        return "SUCCESS";
    }

}

module.exports.ConnectionManager = ConnectionManager;