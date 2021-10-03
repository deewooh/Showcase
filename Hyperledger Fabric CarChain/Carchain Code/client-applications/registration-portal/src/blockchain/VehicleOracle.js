/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {ConnectionManager} = require('./ConnectionManager')
const chaincodeName = 'vehicle';

/**
 * Used by the registration-portal to execute a transaction on the 'vehicle' chaincode 
 * to return the list of all Vehicle Entities.
 * @returns {String} An Array of Vehicle Entities stored on the Distributed Ledger as a String.
 */
async function getAllVehicles() {
	let result;
	let connectionManager = new ConnectionManager();
	try {
		let contract = await connectionManager.init(chaincodeName);
		console.log('\n--> Evaluate Transaction: GetAllVehicles, function returns all the current vehicles on the ledger');
		result = await contract.evaluateTransaction('GetAllVehicles');
		console.log('Result: retrieved');
		console.log(result.toString());
	} catch (error) {
		throw (error);
	} finally {
		let res = connectionManager.disconnect();
		console.log(`Disconnect Status: ${res}`)
	}
	return result.toString();
}

/**
 * Used by the registration-portal to execute a transaction on the 'vehicle' chaincode 
 * to return a single Vehicle Entity for the provided vin.
 * @param {String} vin The Vehicle Identification Number
 * @returns {String} A Vehicle Entity for the provided vin as a String.
 */
async function getVehicle(vin) {
	let result;
	let connectionManager = new ConnectionManager();
	try {
		let contract = await connectionManager.init(chaincodeName);
		console.log('\n--> Evaluate Transaction: GetVehicle, function returns vehicle for provided vin');
		result = await contract.evaluateTransaction('GetVehicle', vin);
		console.log('Result: retrieved');
		console.log(result.toString());
	} catch (error) {
		throw (error);
	} finally {
		let res = connectionManager.disconnect();
		console.log(`Disconnect Status: ${res}`)
	}
	return result.toString();
}


module.exports.getAllVehicles = getAllVehicles;
module.exports.getVehicle = getVehicle;