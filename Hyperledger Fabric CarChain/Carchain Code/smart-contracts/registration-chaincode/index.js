/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const registrationChaincode = require('./lib/registration');

module.exports.RegistrationContract = registrationChaincode;
module.exports.contracts = [registrationChaincode];