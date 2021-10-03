'use strict';

const path = require('path');
const { respondWithCode } = require('../utils/writer.js');
const { Contract } = require('../utils/contract.js');

const config = {
    channelName: 'carchainchannel',
    chaincodeName: 'violation',
    walletPath: path.join(__dirname, '../', '../', '../', 'utilities', 'wallet-generator', 'wallets', 'police', 'wallet'),
    orgUserId: 'PolicePortal'
}
const contract = new Contract(config);

const regoConfig = {
    channelName: 'carchainchannel',
    chaincodeName: 'registration',
    walletPath: path.join(__dirname, '../', '../', '../', 'utilities', 'wallet-generator', 'wallets', 'police', 'wallet'),
    orgUserId: 'PolicePortal'
}
const regoContract = new Contract(regoConfig)

/**
 * Used by the police to create a violation against a vehicle
 *
 * body Violation Violation object containing the Violation details.
 * returns Violation
 **/
exports.addViolation = function(v) {
  return regoContract.evaluateTransaction('GetRegistration', v.Rego_reference).then(() => {
    return contract.submitTransaction('AddViolation', v.Code, v.Description, v.Occurred_date, v.Fine_amount, v.Rego_reference);
  })
}

/**
 * Change status of violation to disputed
 *
 * violationId String id of the violation to dispute
 * returns ApiResponse
 **/
exports.disputeFine = function(violationId) {
  return contract.submitTransaction('DisputeFine', violationId);
}


/**
 * Used to retrieve all violations in the blockchain
 *
 * returns ViolationList
 **/
exports.getAllViolations = function() {
  return contract.evaluateTransaction('GetAllViolations');
}


/**
 * Used to retrieve a specific violation on CarChain
 *
 * violationId Long id of the violation to retrieve
 * returns Violation
 **/
exports.getViolationByViolationId = function(violationId) {
  return contract.evaluateTransaction('RetrieveViolation', violationId);
}


/**
 * Used to retrieve violations for a particular vehicle
 *
 * regoId String rego id of the vehicle
 * returns ViolationList
 **/
exports.getViolationsByRegoId = function(regoId) {
  return regoContract.evaluateTransaction('GetRegistration', regoId).then(() => {
    return contract.evaluateTransaction('GetViolationsByRego', regoId);
  });
}


/**
 * Change status of violation to paid
 *
 * violationId String id of the violation to pay the fine for
 * returns ApiResponse
 **/
exports.payFine = function(violationId) {
  return contract.submitTransaction('PayFine', violationId);
}
