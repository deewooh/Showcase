/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { respondWithCode } = require('./writer.js');
const { Gateway, Wallets } = require('fabric-network');
const {buildCCPOrg1, buildWallet} = require('../../../utilities/fabric-sdk/test-application/javascript/AppUtil.js');

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

class Contract {
    /**
     * @param config.channelName
     * @param config.chaincodeName
     * @param config.walletPath
     * @param config.orgUserId
     */
    constructor(config) {
        this.config = config;
    }

    async submitTransaction(funcName, ...args) {
        let buffer;
        try {
            const ccp = buildCCPOrg1();
            const wallet = await buildWallet(Wallets, this.config.walletPath);
            const gateway = new Gateway();

            try {
                await gateway.connect(ccp, {
                    wallet,
                    identity: this.config.orgUserId,
                    discovery: { enabled: true, asLocalhost: true }
                });

                const network = await gateway.getNetwork(this.config.channelName);
                const contract = network.getContract(this.config.chaincodeName);
                
                console.log(`\n--> Submit Transaction: ${funcName}`)
                buffer = await contract.submitTransaction(funcName, ...args);
                console.log('Transaction committed');
                console.log(`*** Result: ${prettyJSONString(buffer.toString())}`);

            } finally {
                // Disconnect from the gateway when the application is closing
                // This will close all connections to the network
                gateway.disconnect();
            }
        } catch (err) {
            if (err.message.includes('PermissionDenied')) {
                throw respondWithCode(403, { msg: err.message });
            } else if (err.message.includes('NotFound')) {
                throw respondWithCode(404, { msg: err.message });
            } else if (err.message.includes('InvalidInput')) {
                throw respondWithCode(400, { msg: err.message });
            } else {
                console.error(`******** FAILED to run the application: ${error}`);
                throw respondWithCode(500, { msg: 'Internal server error. Service is temporarily unavailable.' });
            }
        }
        let result = buffer.toString();
        return result;
    }

    async evaluateTransaction(funcName, ...args) {
        let buffer;
        try {
            const ccp = buildCCPOrg1();
            const wallet = await buildWallet(Wallets, this.config.walletPath);
            const gateway = new Gateway();

            try {
                await gateway.connect(ccp, {
                    wallet,
                    identity: this.config.orgUserId,
                    discovery: { enabled: true, asLocalhost: true }
                });

                const network = await gateway.getNetwork(this.config.channelName);
                const contract = network.getContract(this.config.chaincodeName);
                
                console.log(`\n--> Evaluate Transaction: ${funcName}`)
                buffer = await contract.evaluateTransaction(funcName, ...args);
                console.log('Transaction evaluated');
                console.log(`*** Result: ${prettyJSONString(buffer.toString())}`);

            } finally {
                // Disconnect from the gateway when the application is closing
                // This will close all connections to the network
                gateway.disconnect();
            }
        } catch (err) {
            if (err.message.includes('PermissionDenied')) {
                throw respondWithCode(403, { msg: err.message });
            } else if (err.message.includes('NotFound')) {
                throw respondWithCode(404, { msg: err.message });
            } else if (err.message.includes('InvalidInput')) {
                throw respondWithCode(400, { msg: err.message });
            } else {
                console.error(`******** FAILED to run the application: ${error}`);
                throw respondWithCode(500, { msg: 'Internal server error. Service is temporarily unavailable.' });
            }
        }
        let result = buffer.toString();
        return result;
    }
}

module.exports.Contract = Contract;
