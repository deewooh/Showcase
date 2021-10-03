/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const violationChaincode = require('./lib/violation');

module.exports.ViolationContract = violationChaincode;
module.exports.contracts = [violationChaincode];