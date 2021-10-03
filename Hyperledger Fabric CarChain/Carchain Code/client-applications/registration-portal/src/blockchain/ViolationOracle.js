/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {getRegistrationHistory} = require('./RegistrationOracle');
const {ConnectionManager} = require('./ConnectionManager')
const chaincodeName = 'violation';


/**
 * Used by the registration-portal to execute a transaction on the 'violation' chaincode 
 * to return the list of all Violation Entities for the provided Customer ID.
 * @param {String} crn The Customer ID.
 * @returns {String} An Array of Violation Entities as a String.
 */
async function getViolationsByCRN(crn) {
    let result = [];
    let connectionManager = new ConnectionManager();
    try {
        let contract = await connectionManager.init(chaincodeName);
        let regoHist = JSON.parse(await getRegistrationHistory(crn));
        let fines = await Promise.all(regoHist.map(rego => {
            const regoId = rego.Record.registrationID;
            return contract.evaluateTransaction('GetViolationsByRego', regoId);
        }));
        fines.forEach(f => {
            JSON.parse(f).forEach(v => {
                result.push(v.Record);
            })
        })
    } catch(err) {
        throw err;
    } finally {
		let res = connectionManager.disconnect();
		console.log(`Disconnect Status: ${res}`)
	}
    result.sort((a, b) => {
        if(a.Occurred_date === b.Occurred_date) return 0;
        else if(a.Occurred_date < b.Occurred_date) return -1;
        else return 0;
    })
    return JSON.stringify(result);
}

/**
 * Used by the registration-portal to execute a transaction on the 'violation' chaincode 
 * to change the status of a Violation Entity to 'Paid'.
 * @param {String} violationId the Violation ID.
 * @returns {String} 'SUCCESS' otherwise throws an error.
 */
async function payFine(violationId) {
	let connectionManager = new ConnectionManager();
	try {
		let contract = await connectionManager.init(chaincodeName);
		await contract.submitTransaction('PayFine', violationId);
	} catch (error) {
		throw (error);
	} finally {
		let res = connectionManager.disconnect();
		console.log(`Disconnect Status: ${res}`)
	}
	return "SUCCESS";
}

module.exports.getViolationsByCRN = getViolationsByCRN;
module.exports.payFine = payFine;
