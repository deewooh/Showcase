/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {ConnectionManager} = require('./ConnectionManager')
const chaincodeName = 'vehicle';


/**
 * Used by the vehicle-api to execute a transaction on the 'vehicle' chaincode 
 * to return the list of all Vehicle Entities.
 * @returns {String} The list of all Vehicle Entities as a String.
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
 * Used by the vehicle-api to execute a transaction on the 'vehicle' chaincode
 * to add a new Vehicle Entity to the Distributed Ledger.
 * @param {Object} vehicle The Vehicle Entity to be added to the Distributed Ledger. 
 * @returns {String} The Vehicle Entity that has been added to the Distributed Ledger.
 */
async function addVehicle(vehicle) {
	let result;
	let connectionManager = new ConnectionManager();
	try {
		let contract = await connectionManager.init(chaincodeName);
        console.log('\n--> Submit Transaction: AddVehicle, function adds a vehicle to the ledger');
        result = await contract.submitTransaction(
            'AddVehicle', vehicle.vin, vehicle.make, vehicle.model, vehicle.model_year, vehicle.body_style);
        console.log('Result: committed');
        console.log(result.toString());
	} catch (error) {
		throw (error);
	} finally {
		let res = connectionManager.disconnect();
		console.log(`Disconnect Status: ${res}`)
	}
	return result.toString();
}


module.exports.addVehicle = addVehicle;
module.exports.getAllVehicles = getAllVehicles;