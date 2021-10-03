/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {ConnectionManager} = require('./ConnectionManager')
const chaincodeName = 'registration';


/**
 * Used by the registration-portal to execute a transaction on the 'registration' chaincode 
 * to return the registration history for a given customer. 
 * @param {String} crn  
 * @returns {String} Array of Registration Entities stored on the Distributed Ledger as a String.
 */
async function getRegistrationHistory(crn) {
	let result;
	let connectionManager = new ConnectionManager();
	try {
		let contract = await connectionManager.init(chaincodeName);
		console.log('\n--> Evaluate Transaction: queryRegoByProperty, function returns the registration history per customer');
		result = await contract.evaluateTransaction('queryRegoByProperty', 'person', crn);
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
 * Used by the registration-portal to execute a transaction on the 'registration' chaincode 
 * to return the registration entities with 'Pending' status.
 * @returns {String} Array of Registration Entities stored on the Distributed Ledger as a String.
 */
async function getPendingRegistrations() {
	let result;
	let connectionManager = new ConnectionManager();
	try {
		let contract = await connectionManager.init(chaincodeName);
		console.log('\n--> Evaluate Transaction: queryRegoByProperty, function returns the pending registrations');
		result = await contract.evaluateTransaction('queryRegoByProperty', 'status', 'Pending');
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
 * Used by the registration-portal to execute a transaction on the 'registration' chaincode 
 * to return a single Registration entity for the provided regoID.
 * @param {String} regoID The registration ID.
 * @returns {String} The Registration Entity with the corresponding regoID as a String.
 */
async function getRegistrationByID(regoID) {
	let result;
	let connectionManager = new ConnectionManager();
	try {
		let contract = await connectionManager.init(chaincodeName);
		console.log('\n--> Evaluate Transaction: GetRegistration, function returns the registration for provided ID');
		result = await contract.evaluateTransaction('GetRegistration', regoID);
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
 * Used by the registration-portal to execute a transaction on the 'registration' chaincode 
 * to add a registration to the Distributed Ledger.
 * @param {String} vin 
 * @param {String} state 
 * @param {String} crn 
 * @param {String} licencePlate 
 * @returns {String} The Registration Entity that has been added as a String
 */
async function submitRegistration(vin, state, crn, licencePlate) {

	let result;
	let connectionManager = new ConnectionManager();
	try {
		let contract = await connectionManager.init(chaincodeName);
		console.log('\n--> Evaluate Transaction: startRegistration adds a new registration to the blockchain');
		result = await contract.submitTransaction('startRegistration', vin, state, crn, licencePlate);
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
 * Used by the registration-portal to execute a transaction on the 'registration' chaincode 
 * to change the status of a Registration Entity to 'Approve'.
 * @param {String} regoID 
 * @returns {String} 'SUCCESS' otherwise throws an error
 */
async function approveRegistration(regoID) {

	let connectionManager = new ConnectionManager();
	try {
		let contract = await connectionManager.init(chaincodeName);
		console.log('\n--> Submit Transaction: approveRego changes the status to Approved');
		await contract.submitTransaction('approveRego', regoID, getDate());
	} catch (error) {
		throw (error);
	} finally {
		let res = connectionManager.disconnect();
		console.log(`Disconnect Status: ${res}`)
	}
	return "SUCCESS";

}

/**
 * Used by the registration-portal to execute a transaction on the 'registration' chaincode 
 * to change the status of a Registration Entity to 'Canclled'.
 * @param {String} regoID 
 * @returns {String} 'SUCCESS' otherwise throws an error
 */
async function cancelRegistration(regoID, comment) {

	let connectionManager = new ConnectionManager();
	try {
		let contract = await connectionManager.init(chaincodeName);
		console.log('\n--> Submit Transaction: cancelRego changes the status to Cancelled');
		await contract.submitTransaction('cancelRego', regoID, getDate(), comment);
	} catch (error) {
		throw (error);
	} finally {
		let res = connectionManager.disconnect();
		console.log(`Disconnect Status: ${res}`)
	}
	return "SUCCESS";

}

/**
 * @returns {String} The current date formatted as yyyy-mm-dd
 */
function getDate() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; 
	var yyyy = today.getFullYear();

	if(dd<10) { dd='0'+dd; } 
	if(mm<10) { mm='0'+mm; } 

	return yyyy + '-' + mm + '-' + dd;
}

module.exports.getRegistrationHistory = getRegistrationHistory;
module.exports.getPendingRegistrations = getPendingRegistrations;
module.exports.getRegistrationByID = getRegistrationByID;
module.exports.submitRegistration = submitRegistration;
module.exports.approveRegistration = approveRegistration;
module.exports.cancelRegistration = cancelRegistration;