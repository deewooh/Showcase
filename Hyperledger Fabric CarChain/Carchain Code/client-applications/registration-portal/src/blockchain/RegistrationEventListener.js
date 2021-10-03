/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ConnectionManager } = require('./ConnectionManager')
const { sendEmail, formatApproveEmail, formatCancelEmail } = require('../util/EmailHelper')
const { getCustomerRecord } = require('../db/DBClient')
const chaincodeName = 'registration';

/**
 * Initialises an Event Listener for the 'registration' smart contract.
 * Any events emitted by the 'registration' smart contract will be consumed by this Listener.
 * 
 * This implementation will send 'Approval' and 'Cancel' emails in response to events sent by 'registration' smart contract.
 */
async function initRegoEventListener() {
    let connectionManager = new ConnectionManager();
    try {
        let contract = await connectionManager.init(chaincodeName);
        let listener = async (event) => {

            console.log(`\n\nRegistration Event Received: ${event.eventName}`);
            const registration = JSON.parse(event.payload.toString());

            // Retrieve the customer details from the database
            getCustomerRecord(registration.person, (err, cust) => {
                if (err) {
                  console.log(err);
                } else {
                    console.log('Customer details retrieved ...');
                    console.log(cust);
                    // send Approve email
                    if (event.eventName === 'ApproveRego') {
                        sendEmail(cust.email, `Your Registration ${registration.registrationID} has been Approved`, 
                        formatApproveEmail(registration.registrationID, cust.first_name));
                    }
                    // send Cancel email
                    if (event.eventName === 'CancelRego') {
                        sendEmail(cust.email, `Your Registration ${registration.registrationID} has been Cancelled`, 
                        formatCancelEmail(registration.registrationID, cust.first_name, registration.comment));
                    }
                }
            })
        };
        
        // register the listener with the smart contract
        console.log(`Registering the listener with chaincode: ${chaincodeName}`);
        await contract.addContractListener(listener);

    } catch (error) {
        console.log("Listener error: " + error);
    }
}

module.exports.initRegoEventListener = initRegoEventListener;